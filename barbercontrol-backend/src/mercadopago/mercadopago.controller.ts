import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { MercadopagoService } from './mercadopago.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payment')
export class MercadopagoController {
  constructor(private readonly mercadopagoService: MercadopagoService) { }

  @Post('pix')
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.mercadopagoService.create(createPaymentDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const response = await this.mercadopagoService.getPaymentByUuid(id);

    return {
      status: response.status,
      message: response.message
    }
  }
}
