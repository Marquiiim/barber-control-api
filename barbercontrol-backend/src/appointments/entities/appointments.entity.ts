import { AppointmentPayment } from '../status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class AppointmentEntity {
    @ApiProperty({
        description: 'Nome do cliente',
        example: 'Marcos Gabriel',
        minLength: 3,
        maxLength: 100
    })
    name!: string;


    @ApiProperty({
        description: 'Número do cliente',
        example: '99 999999999',
        minLength: 12,
        maxLength: 12
    })
    phone_number!: string;

    @ApiProperty({
        description: 'Id do serviço',
        example: 'Apenas serviços existentes no banco',
    })
    service_id!: number;

    @ApiProperty({
        description: 'Data do agendamento',
        example: 'Apenas datas geradas pelo backend',
    })
    appointment_date!: string;

    @ApiProperty({
        description: 'Id do horário selecionado para realização do serviço',
        example: 'Apenas horários existentes no banco',
    })
    hour_id!: number

    @ApiProperty({
        description: 'Tipo de pagamento',
        example: 'Pix, Débito, Crédito, Dinheiro',
        enum: ['pix', 'd_bito', 'cr_dito', 'dinheiro']
    })
    type_payment!: AppointmentPayment
}
