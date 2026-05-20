import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createAppointmentDto: CreateAppointmentDto) {
    return await this.prisma.appointments.create({
      data: createAppointmentDto
    });
  }

  async findHours() {
    return await this.prisma.schedules.findMany()
  }

  async findServices() {
    return await this.prisma.services.findMany();
  }

  async findOne(id: number) {
    return `This action returns a #${id} appointment`;
  }

  async remove(id: number) {
    return `This action removes a #${id} appointment`;
  }
}
