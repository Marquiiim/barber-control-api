import { Global, Module } from '@nestjs/common';
import { MercadopagoService } from './mercadopago.service';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { PrismaModule } from '../prisma/prisma.module';
import { MercadopagoController } from './mercadopago.controller';

@Global()
@Module({
  imports: [
    PrismaModule
  ],
  controllers: [MercadopagoController],
  providers: [
    {
      provide: 'MERCADO_PAGO_CLIENT',
      useFactory: () => {
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
        if (!accessToken) throw new Error('Erro ao carregar configurações de transação')

        return new MercadoPagoConfig({ accessToken, options: { timeout: 3000 } })
      }
    },
    {
      provide: 'PAYMENT_SERVICE',
      useFactory: (client: MercadoPagoConfig) => new Payment(client),
      inject: ['MERCADO_PAGO_CLIENT']
    },
    MercadopagoService
  ],
  exports: [MercadopagoService, 'PAYMENT_SERVICE'],
})
export class MercadopagoModule { }
