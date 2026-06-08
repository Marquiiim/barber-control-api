import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
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

  async create(createAppointmentDto: CreateAppointmentDto, ip: string) {
    const checkPendingIssues = await this.prisma.payments.findFirst({
      where: {
        payer_email: createAppointmentDto.email,
        status: 'pending'
      },
      include: {
        appointments: true
      }
    })

    if (checkPendingIssues && checkPendingIssues.appointments) {
      if (
        checkPendingIssues.appointments?.email?.toLowerCase() === createAppointmentDto.email?.toLowerCase() ||
        checkPendingIssues.appointments?.phone_number?.trim() === createAppointmentDto.phone_number?.trim()
      ) {
        if (
          checkPendingIssues.appointments?.payment_status === 'pendente' &&
          checkPendingIssues.status === 'pending'
        ) {
          if (new Date() > new Date(checkPendingIssues.expires_at)) {
            await this.prisma.$transaction([
              this.prisma.payments.delete({ where: { id: checkPendingIssues.id } }),
              this.prisma.appointments.delete({ where: { id: checkPendingIssues.appointments.id } })
            ])

            throw new Error('Seu pagamento expirou. Por favor, faça um novo agendamento')
          }

          return {
            success: false,
            message: 'Você já possui um agendamento pendente para este horário',
            payment: {
              payment_uuid: checkPendingIssues.uuid,
              status: checkPendingIssues.status,

              qr_code: checkPendingIssues.qr_code,
              qr_code_base64: checkPendingIssues.qr_code_base64,
              ticket_url: checkPendingIssues.ticket_url,

              amount: checkPendingIssues.amount,
              expiration_date: checkPendingIssues.expires_at
            }
          }
        }
      }
    }

    const checkingAvailableSchedules = await this.prisma.appointments.findFirst({
      where: {
        appointment_date: createAppointmentDto.appointment_date,
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
        appointment_date: new Date(createAppointmentDto.appointment_date),
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

    const availableHours = result.filter(h => {
      const [hour, minute] = h.time.split(':').map(Number)
      return hour > new Date().getHours() || (hour === new Date().getHours() && minute > new Date().getMinutes())
    })

    return {
      dates: DateUtils.getDaysOfCurrentMonth(),
      hours: availableHours
    }
  }

  async findOne(id: number) {
    return `This action returns a #${id} appointment`;
  }

  async remove(id: number) {
    return `This action removes a #${id} appointment`;
  }
}
