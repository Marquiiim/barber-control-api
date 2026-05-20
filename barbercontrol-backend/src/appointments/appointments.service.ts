import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { schedules } from '@prisma/client';
import DateUtils from '../utils/datesSchedules'

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createAppointmentDto: CreateAppointmentDto) {
    return await this.prisma.appointments.create({
      data: createAppointmentDto
    });
  }

  async findServices() {
    return await this.prisma.services.findMany();
  }

  async findSchedules(date: string) {
    const result = await this.prisma.$queryRaw`
        SELECT
          s.id,
          DATE_FORMAT(s.availables, '%H:%i') as time
        FROM schedules s
        LEFT JOIN appointments a ON a.time_id = s.id
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
