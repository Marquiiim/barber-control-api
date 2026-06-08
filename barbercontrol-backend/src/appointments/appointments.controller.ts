import { Controller, Get, Post, Body, Param, Delete, Query, Ip, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiCrudEndpoint, EndpointType } from '../commons/api-crud.decorators';
import { AppointmentEntity } from './entities/appointments.entity';
import { IpBlockGuard } from '../guards/ip-block.guard';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Post('to-schedule')
  @UseGuards(IpBlockGuard)
  @ApiCrudEndpoint(EndpointType.CREATE, AppointmentEntity, 'Agendamento')
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @Ip() ip: string) {
    const response = await this.appointmentsService.create(createAppointmentDto, ip);
    return {
      success: response.success,
      message: response.message,
      payment: {
        payment_uuid: response.payment.payment_uuid,
        status: response.payment.status,
        qr_code: response.payment.qr_code,
        qr_code_base64: response.payment.qr_code_base64,
        ticket_url: response.payment.ticket_url,
        amount: response.payment.amount,
        expiration_date: response.payment.expiration_date
      }
    }
  }

  @Get('services')
  async findServices() {
    return await this.appointmentsService.findServices()
  }

  @Get('schedules')
  async findSchedules(@Query('date') date: string) {
    return await this.appointmentsService.findSchedules(date)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.appointmentsService.findOne(+id)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.appointmentsService.remove(+id)
  }
}
