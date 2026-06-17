import { Inject, Injectable, Logger } from '@nestjs/common';
import { Payment } from 'mercadopago';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'node:crypto';

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
      date_of_expiration: this.getExpirationDate(10),
      statement_descriptor: 'Barbercontrol'
    }

    try {
      const response = await this.paymentService.create({ body })

      const payment_uuid = randomUUID()

      await this.prisma.payments.create({
        data: {
          uuid: Buffer.from(payment_uuid.replace(/-/g, ''), 'hex'),
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
        payment_uuid: payment_uuid,
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

  async getPaymentByUuid(paymentUuid: string) {
    try {
      const foundPayment = await this.prisma.payments.findFirst({
        where: { uuid: Buffer.from(paymentUuid.replace(/-/g, ''), 'hex') },
        select: {
          mp_payment_id: true,
          appointment_id: true,
          expires_at: true
        }
      })

      if (!foundPayment) throw new Error('Pagamento não encontrado')

      const paymentResponse = await this.paymentService.get({ id: foundPayment.mp_payment_id })

      if (paymentResponse.status === 'approved') {
        await this.prisma.payments.update({
          where: { mp_payment_id: String(paymentResponse.id) },
          data: {
            status: paymentResponse.status,
            approved_at: new Date()
          }
        })

        if (foundPayment?.appointment_id) {
          await this.prisma.appointments.update({
            where: { id: foundPayment.appointment_id },
            data: {
              payment_status: 'aprovado'
            }
          })
        }

        return {
          status: 'aprovado',
          message: 'Pagamento aprovado com sucesso'
        }
      } else if (paymentResponse.status === 'pending') {
        if (new Date() >= new Date(foundPayment.expires_at)) {
          await this.prisma.payments.delete({ where: { uuid: Buffer.from(paymentUuid.replace(/-/g, ''), 'hex') } })
          await this.prisma.appointments.delete({ where: { id: foundPayment.appointment_id } })

          return {
            status: 'expirado',
            message: 'Pagamento expirado'
          }
        }
      }
      return {
        status: 'pendente',
        message: 'Pagamento está pendente'
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      this.logger.error(`Erro ao buscar pagamento pix: ${paymentUuid}: ${errorMessage}`)
      throw new Error(`Erro ao buscar pagamento pix: ${errorMessage}`)
    }
  }

  async remove(id: string) {
    return this.paymentService.cancel({ id: id })
  }

  private getExpirationDate(minutes: number): string {
    const date = new Date()
    date.setMinutes(date.getMinutes() + minutes)
    return date.toISOString()
  }
}
