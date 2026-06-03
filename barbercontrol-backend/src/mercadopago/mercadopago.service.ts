import { Inject, Injectable, Logger } from '@nestjs/common';
import { Payment } from 'mercadopago';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MercadopagoService {
  private readonly logger = new Logger(MercadopagoService.name)
  constructor(
    @Inject('PAYMENT_SERVICE') private readonly paymentService: Payment,
    private readonly prisma: PrismaService
  ) { }

  async create(createPaymentDto: CreatePaymentDto) {
    const { transaction_amount, description, payment_type, payer_email, appointment_id } = createPaymentDto

    const body = {
      transaction_amount,
      description,
      installments: 1,
      payment_method_id: payment_type,
      payer: {
        email: payer_email,
        first_name: 'Cliente',
        last_name: 'Barbercontrol'
      },
      date_of_expiration: this.getExpirationDate(15),
      statement_descriptor: 'Barbercontrol'
    }

    try {
      const response = await this.paymentService.create({ body })

      await this.prisma.payments.create({
        data: {
          mp_payment_id: String(response.id),
          amount: response.transaction_amount,
          status: response.status,
          description: response.description,
          payer_email: payer_email,
          payment_method: payment_type,
          qr_code: response.point_of_interaction?.transaction_data?.qr_code,
          qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64,
          ticket_url: response.point_of_interaction?.transaction_data?.ticket_url,
          expires_at: response.date_of_expiration,
          approved_at: null,
          appointment_id: appointment_id
        }
      })

      return {
        payment_id: response.id,
        status: response.status,

        qr_code: response.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: response.point_of_interaction?.transaction_data?.ticket_url,

        amount: response.transaction_amount,
        expiration_date: response.date_of_expiration
      }
    } catch (error) {
      if (appointment_id) await this.prisma.appointments.delete({ where: { id: appointment_id } }).catch(() => { })
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      this.logger.error(`Erro ao criar pagamento pix: ${errorMessage}`)
      throw new Error(`Erro ao criar pagamento pix: ${errorMessage}`)
    }
  }

  async getPaymentId(paymentId: number) {
    try {
      const paymentResponse = await this.paymentService.get({ id: paymentId })

      if (paymentResponse.status === 'approved') {
        await this.prisma.payments.update({
          where: { mp_payment_id: String(paymentResponse.id) },
          data: {
            status: paymentResponse.status,
            approved_at: new Date()
          }
        })

        const payment = await this.prisma.payments.findFirst({
          where: { mp_payment_id: String(paymentResponse.id) },
          select: {
            appointment_id: true
          }
        })

        if (payment?.appointment_id) {
          await this.prisma.appointments.update({
            where: { id: payment.appointment_id },
            data: {
              payment_status: 'aprovado'
            }
          })
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      this.logger.error(`Erro ao buscar pagamento pix: ${paymentId}: ${errorMessage}`)
      throw new Error(`Erro ao buscar pagamento pix: ${errorMessage}`)
    }
  }

  private getExpirationDate(minutes: number): string {
    const date = new Date()
    date.setMinutes(date.getMinutes() + minutes)
    return date.toISOString()
  }
}
