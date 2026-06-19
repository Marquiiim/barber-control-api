import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
import { MercadopagoService } from './mercadopago.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiCrudEndpoint, EndpointType } from '../commons/api-crud.decorators';

@ApiTags('Pagamento Mercado Pago')
@Controller('payment')
export class MercadopagoController {
  constructor(private readonly mercadopagoService: MercadopagoService) { }

  @ApiCrudEndpoint(EndpointType.CREATE, 'pagamento via Mercado Pago')
  @Post('pix')
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return await this.mercadopagoService.create(createPaymentDto);
  }

  @ApiCrudEndpoint(EndpointType.GET_BY_ID, 'pagamento via Mercado Pago')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.mercadopagoService.getPaymentByUuid(id);
  }
}
