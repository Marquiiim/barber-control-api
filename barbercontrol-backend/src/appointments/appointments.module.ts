import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MercadopagoModule } from '../mercadopago/mercadopago.module';

@Module({
  imports: [
    PrismaModule,
    MercadopagoModule
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule { }
