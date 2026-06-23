import { Injectable } from '@nestjs/common';
import { UpdateAdminAppointmentDto } from './dto/update-admin-appointment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminAppointmentsService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(cursor?: number, limit: number = 6) {
    const appointments = await this.prisma.appointments.findMany({
      where: {
        payment_status: 'aprovado',
        appointment_date: {
          gte: new Date(`${new Date().toISOString().split('T')[0]}T00:00:00.000Z`),
          lte: new Date(`${new Date().toISOString().split('T')[0]}T23:59:59.999Z`)
        }
      },
      include: {
        services: {
          select: { availables: true }
        },
        schedules: {
          select: { availables: true }
        }
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: {
        appointment_date: 'desc'
      }
    })

    if (appointments.length > limit) appointments.pop()

    return {
      found: appointments.map(appointment => ({
        ...appointment,
        schedules: new Date(appointment.schedules.availables).toTimeString().slice(0, 5),
        services: appointment.services.availables
      })),
      meta: {
        hasNext: appointments.length > limit,
        nextCursor: appointments.length > limit ? appointments[appointments.length - 1] : null,
        limit,
        total: appointments.length
      }
    }
  }

  async findOne(id: number) {
    return `This action returns a #${id} adminAppointment`;
  }

  async update(id: number, updateAdminAppointmentDto: UpdateAdminAppointmentDto) {
    return `This action updates a #${id} adminAppointment`;
  }

  async remove(id: number) {
    return `This action removes a #${id} adminAppointment`;
  }
}
