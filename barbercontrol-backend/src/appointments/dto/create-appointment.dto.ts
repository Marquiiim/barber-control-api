import { MinLength, MaxLength, IsNotEmpty, IsString, IsNumber, IsDateString, IsEnum } from 'class-validator'
import { AppointmentPayment } from '../status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
    @ApiProperty({
        description: 'Nome do cliente',
        example: 'Marcos Gabriel',
        minLength: 3,
        maxLength: 100
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(3, { message: 'Nome de cliente muito curto' })
    @MaxLength(100, { message: 'Nome de cliente muito longo' })
    name!: string;


    @ApiProperty({
        description: 'Número do cliente',
        example: '99 999999999',
        minLength: 11,
        maxLength: 11
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(11, { message: 'Telefone deve ter no mínimo 12 caracteres' })
    @MaxLength(11, { message: 'Telefone deve ter no máximo 12 caracteres' })
    phone_number!: string;

    @ApiProperty({
        description: 'Id do serviço',
        example: 'Apenas serviços existentes no banco',
    })
    @IsNotEmpty()
    @IsNumber()
    service_id!: number;

    @ApiProperty({
        description: 'Data do agendamento',
        example: 'Apenas datas geradas pelo backend',
    })
    @IsNotEmpty({ message: 'Data do agendamento é obrigatória' })
    @IsDateString()
    appointment_date!: string;

    @ApiProperty({
        description: 'Id do horário selecionado para realização do serviço',
        example: 'Apenas horários existentes no banco',
    })
    @IsNotEmpty({ message: 'Hora do agendamento é obrigatória' })
    @IsNumber()
    hour_id!: number

    @ApiProperty({
        description: 'Tipo de pagamento',
        example: 'Pix, Débito, Crédito, Dinheiro',
    })
    @IsNotEmpty({ message: 'Tipo de pagamento é obrigatório' })
    @IsString()
    @IsEnum(AppointmentPayment)
    type_payment!: AppointmentPayment
}
