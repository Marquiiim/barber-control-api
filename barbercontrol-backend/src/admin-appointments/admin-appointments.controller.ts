import { Controller, Get, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AdminAppointmentsService } from './admin-appointments.service';
import { UpdateAdminAppointmentDto } from './dto/update-admin-appointment.dto';

@Controller('admin-appointments')
export class AdminAppointmentsController {
  constructor(private readonly adminAppointmentsService: AdminAppointmentsService) { }

  @Get('clients')
  findAll(@Query('cursor') cursor?: string) {
    return this.adminAppointmentsService.findAll(+cursor);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminAppointmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminAppointmentDto: UpdateAdminAppointmentDto) {
    return this.adminAppointmentsService.update(+id, updateAdminAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminAppointmentsService.remove(+id);
  }
}
