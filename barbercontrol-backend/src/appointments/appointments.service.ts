import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import DateUtils from '../utils/datesSchedules'
import { MercadopagoService } from '../mercadopago/mercadopago.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: MercadopagoService
  ) { }

  private toSaoPauloDate(dateString: string): Date {
    const cleanDate = dateString.split('T')[0];
    const [year, month, day] = cleanDate.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  }

  private formatSaoPauloDate(date: Date): string {
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  async create(createAppointmentDto: CreateAppointmentDto, ip: string) {
    const pendingAppointment = await this.prisma.appointments.findFirst({
      where: {
        payment_status: 'pendente',
        OR: [
          { email: createAppointmentDto.email },
          { phone_number: createAppointmentDto.phone_number }
        ]
      },
      include: {
        payments: true,
        schedules: true
      }
    })

    if (
      pendingAppointment &&
      pendingAppointment.payments &&
      pendingAppointment.payments.length > 0
    ) {
      if (
        pendingAppointment?.payments[0]?.payer_email?.toLowerCase() === createAppointmentDto.email?.toLowerCase() ||
        pendingAppointment?.email?.toLowerCase() === createAppointmentDto.email?.toLowerCase() ||
        pendingAppointment?.phone_number?.trim() === createAppointmentDto.phone_number?.trim()
      ) {
        if (
          pendingAppointment?.payment_status === 'pendente' &&
          pendingAppointment.payments[0].status === 'pending'
        ) {
          if (new Date() > new Date(pendingAppointment.payments[0].expires_at)) {
            await this.prisma.$transaction([
              this.prisma.payments.delete({ where: { id: pendingAppointment.payments[0].id } }),
              this.prisma.appointments.delete({ where: { id: pendingAppointment.id } })
            ])

            throw new BadRequestException('Seu pagamento expirou. Por favor, faça um novo agendamento')
          }

          return {
            success: false,
            message: `Você possui um agendamento pendente para o dia ${this.formatSaoPauloDate(pendingAppointment.appointment_date)} as ${String(pendingAppointment.schedules.availables.getUTCHours()).padStart(2, '0')}:${String(pendingAppointment.schedules.availables.getUTCMinutes()).padStart(2, '0')}`,
            payment: {
              payment_uuid: Buffer.from(pendingAppointment.payments[0].uuid).toString('hex'),
              status: pendingAppointment.payments[0].status,

              qr_code: pendingAppointment.payments[0].qr_code,
              qr_code_base64: pendingAppointment.payments[0].qr_code_base64,
              ticket_url: pendingAppointment.payments[0].ticket_url,

              amount: pendingAppointment.payments[0].amount,
              expiration_date: pendingAppointment.payments[0].expires_at
            }
          }
        }
      }
    }

    const checkingAvailableSchedules = await this.prisma.appointments.findFirst({
      where: {
        appointment_date: this.toSaoPauloDate(createAppointmentDto.appointment_date),
        hour_id: createAppointmentDto.hour_id,
        service_id: createAppointmentDto.service_id
      }
    })

    if (checkingAvailableSchedules) throw new ConflictException('Este horário já está ocupado por um cliente')

    const service = await this.prisma.services.findUnique({
      where: { id: createAppointmentDto.service_id }
    })

    if (!service) throw new NotFoundException('Serviço não encontrado')

    const appointment = await this.prisma.appointments.create({
      data: {
        ip: ip,
        name: createAppointmentDto.name,
        email: createAppointmentDto.email,
        phone_number: createAppointmentDto.phone_number,
        appointment_date: this.toSaoPauloDate(createAppointmentDto.appointment_date),
        payment_type: createAppointmentDto.payment_type,
        services: {
          connect: { id: createAppointmentDto.service_id }
        },
        schedules: {
          connect: { id: createAppointmentDto.hour_id }
        }
      }
    })

    const paymentData = {
      transaction_amount: Number(service.price),
      description: `Agendamento #${appointment.id} - ${service.availables}`,
      payment_type: createAppointmentDto.payment_type,
      payer_email: createAppointmentDto.email,
      appointment_id: appointment.id
    }

    const payment = await this.paymentService.create(paymentData)

    return {
      success: true,
      appointment: appointment,
      payment: payment
    }
  }

  async findServices() {
    return await this.prisma.services.findMany({
      select: {
        id: true,
        availables: true,
        description: true
      }
    });
  }

  async findSchedules(date: string) {
    const result = await this.prisma.$queryRaw<{ id: number; time: string }[]>`
        SELECT
          s.id,
          DATE_FORMAT(s.availables, '%H:%i') as time
        FROM schedules s
        LEFT JOIN appointments a ON a.hour_id = s.id
          AND DATE(a.appointment_date) = DATE(${date})
        WHERE a.id IS NULL
        ORDER BY s.availables
      `

    let availableHours = result

    if (new Date(date).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]) {
      availableHours = result.filter(h => {
        const [hour, minute] = h.time.split(':').map(Number)

        return hour > new Date().getHours() || (hour === new Date().getHours() && minute > new Date().getMinutes())
      })
    }

    return {
      dates: DateUtils.getDaysOfCurrentMonth(),
      hours: availableHours
    }
  }

  async remove(uuid: string) {
    const paymentRecord = await this.prisma.payments.findFirst({
      where: { uuid: Buffer.from(uuid.replace(/-/g, ''), 'hex') },
      select: {
        mp_payment_id: true,
        appointments: {
          select: {
            id: true
          }
        }
      }
    })

    if (!paymentRecord) throw new NotFoundException('Pagamento não encontrado')

    if (!paymentRecord.appointments) throw new NotFoundException('Agendamento não encontrado para esse pagamento')

    const cancelResult = await this.paymentService.remove(paymentRecord.mp_payment_id)

    if (!cancelResult || cancelResult.status !== 'cancelled') throw new Error('Falha ao cancelar pagamento')

    await this.prisma.$transaction([
      this.prisma.payments.delete({ where: { mp_payment_id: paymentRecord.mp_payment_id } }),
      this.prisma.appointments.delete({ where: { id: paymentRecord.appointments.id } })
    ])

    return {
      success: true,
      message: 'Agendamento cancelado com sucesso'
    }
  }
}
