import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MercadopagoModule } from './mercadopago/mercadopago.module';

@Module({
  imports: [
    PrismaModule,
    AppointmentsModule,
    MercadopagoModule
  ]
})
export class AppModule { }
