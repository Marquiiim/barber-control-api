import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { MercadopagoService } from './mercadopago.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payment')
export class MercadopagoController {
  constructor(private readonly mercadopagoService: MercadopagoService) { }

  @Post('pix')
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.mercadopagoService.create(createPaymentDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.mercadopagoService.getPaymentId(+id);
  }
}
