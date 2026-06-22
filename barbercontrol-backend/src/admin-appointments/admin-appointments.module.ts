import { Module } from '@nestjs/common';
import { AdminAppointmentsService } from './admin-appointments.service';
import { AdminAppointmentsController } from './admin-appointments.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminAppointmentsController],
  providers: [AdminAppointmentsService],
})
export class AdminAppointmentsModule { }
