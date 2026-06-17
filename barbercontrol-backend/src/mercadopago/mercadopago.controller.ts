import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
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
    return await this.mercadopagoService.getPaymentByUuid(id);
  }
}
