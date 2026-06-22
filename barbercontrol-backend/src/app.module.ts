import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MercadopagoModule } from './mercadopago/mercadopago.module';
import { AdminAppointmentsModule } from './admin-appointments/admin-appointments.module';

@Module({
  imports: [
    PrismaModule,
    AppointmentsModule,
    MercadopagoModule,
    AdminAppointmentsModule
  ]
})
export class AppModule { }
