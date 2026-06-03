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
    const isAlreadyExisting = await this.prisma.$queryRaw`
      SELECT COUNT(*) as total FROM appointments
      WHERE DATE(appointment_date) = ${new Date(createAppointmentDto.appointment_date).toISOString().split('T')[0]}
      AND hour_id = ${createAppointmentDto.hour_id}
      `

    if (isAlreadyExisting[0].total > 0) throw new ConflictException('Esse horário já esta agendado')

    const service = await this.prisma.services.findUnique({
      where: { id: createAppointmentDto.service_id }
    })

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
