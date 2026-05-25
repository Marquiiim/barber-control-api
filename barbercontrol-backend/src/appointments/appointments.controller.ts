import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiCrudEndpoint, EndpointType } from '../commons/api-crud.decorators';
import { AppointmentEntity } from './entities/appointments.entity';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Post('to-schedule')
  @ApiCrudEndpoint(EndpointType.CREATE, AppointmentEntity, 'Agendamento')
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    await this.appointmentsService.create(createAppointmentDto);
    return {
      success: true,
      message: 'Agendamento feito com sucesso'
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
