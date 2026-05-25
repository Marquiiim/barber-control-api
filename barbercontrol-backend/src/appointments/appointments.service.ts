import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import DateUtils from '../utils/datesSchedules'

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createAppointmentDto: CreateAppointmentDto) {
    const isAlreadyExisting = await this.prisma.$queryRaw`
      SELECT COUNT(*) as total FROM appointments
      WHERE DATE(appointment_date) = ${new Date(createAppointmentDto.appointment_date).toISOString().split('T')[0]}
      AND hour_id = ${createAppointmentDto.hour_id}
      `

    if (isAlreadyExisting[0].total > 0) throw new ConflictException('Esse horário já esta agendado')

    return await this.prisma.appointments.create({
      data: {
        name: createAppointmentDto.name,
        phone_number: createAppointmentDto.phone_number,
        appointment_date: new Date(createAppointmentDto.appointment_date),
        type_payment: createAppointmentDto.type_payment,
        services: {
          connect: { id: createAppointmentDto.service_id }
        },
        schedules: {
          connect: { id: createAppointmentDto.hour_id }
        }
      }
    });
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
    const result = await this.prisma.$queryRaw`
        SELECT
          s.id,
          DATE_FORMAT(s.availables, '%H:%i') as time
        FROM schedules s
        LEFT JOIN appointments a ON a.hour_id = s.id
          AND DATE(a.appointment_date) = DATE(${date})
        WHERE a.id IS NULL
        ORDER BY s.availables
      `

    return {
      dates: DateUtils.getDaysOfCurrentMonth(),
      hours: result
    }
  }

  async findOne(id: number) {
    return `This action returns a #${id} appointment`;
  }

  async remove(id: number) {
    return `This action removes a #${id} appointment`;
  }
}
