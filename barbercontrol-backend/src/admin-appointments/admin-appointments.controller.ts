import { Controller, Get, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AdminAppointmentsService } from './admin-appointments.service';
import { UpdateAdminAppointmentDto } from './dto/update-admin-appointment.dto';

@Controller('admin-appointments')
export class AdminAppointmentsController {
  constructor(private readonly adminAppointmentsService: AdminAppointmentsService) { }

  @Get('clients')
  async findAll(@Query('cursor') cursor?: string) {
    return await this.adminAppointmentsService.findAll(+cursor);
  }

  @Get('appointments/available')
  async available(@Query('selectedDate') selectedDate?: string) {
    return await this.adminAppointmentsService.available(selectedDate)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAdminAppointmentDto: UpdateAdminAppointmentDto) {
    return await this.adminAppointmentsService.update(+id, updateAdminAppointmentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.adminAppointmentsService.remove(+id);
  }
}
