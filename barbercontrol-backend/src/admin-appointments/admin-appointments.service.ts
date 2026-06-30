import { Injectable } from '@nestjs/common';
import { UpdateAdminAppointmentDto } from './dto/update-admin-appointment.dto';
import { PrismaService } from '../prisma/prisma.service';
import DateUtils from '../utils/datesSchedules';

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

    const totalAppointmentsToday = await this.prisma.appointments.count({
      where: {
        payment_status: 'aprovado',
        appointment_date: {
          gte: new Date(`${new Date().toISOString().split('T')[0]}T00:00:00.000Z`),
          lte: new Date(`${new Date().toISOString().split('T')[0]}T23:59:59.999Z`)
        }
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
        total: totalAppointmentsToday
      }
    }
  }

  async available(selectedDate?: string) {
    const appointmentsBusy = await this.prisma.appointments.findMany({
      where: {
        payment_status: 'aprovado'
      },
      select: {
        appointment_date: true,
        hour_id: true
      }
    })

    const monthDays = DateUtils.getDaysOfCurrentMonth().map(({ formattedFromValue }) => formattedFromValue)
    const busiesDays = appointmentsBusy.map(({ appointment_date }) => new Date(appointment_date).toISOString().split('T')[0])

    const daysAvailables = monthDays.filter(day => !busiesDays.includes(day))

    let hoursDay = await this.prisma.schedules.findMany({
      where: {
        id: { notIn: appointmentsBusy.map(({ hour_id }) => hour_id) }
      }
    })

    if ((selectedDate || daysAvailables[0]) === new Date().toISOString().split('T')[0]) {
      hoursDay = hoursDay.filter(({ availables }) => {
        return new Date(availables).getHours() > new Date().getHours() || (new Date(availables).getHours() === new Date().getHours() && new Date(availables).getMinutes() > new Date().getMinutes())
      })
    }

    return {
      dates: daysAvailables.map(day => new Date(day).toLocaleDateString('pt-BR')),
      hours: hoursDay.map(({ availables }) => new Date(availables).toISOString().split('T')[1].slice(0, 5))
    }
  }

  async update(id: number, updateAdminAppointmentDto: UpdateAdminAppointmentDto) {
    return `This action updates a #${id} adminAppointment`;
  }

  async remove(id: number) {
    return `This action removes a #${id} adminAppointment`;
  }
}
