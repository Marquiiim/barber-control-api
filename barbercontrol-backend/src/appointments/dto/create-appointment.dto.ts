import { MinLength, MaxLength, IsNotEmpty, IsString, IsNumber, IsDateString, IsEnum, IsEmail, IsIn } from 'class-validator'
import { AppointmentPayment } from '../status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
    @ApiProperty({
        description: 'Nome do cliente',
        example: 'Marcos Gabriel',
        minLength: 3,
        maxLength: 100
    })
    @IsNotEmpty({ message: 'O nome do cliente é obrigatório' })
    @IsString({ message: 'O nome deve ser um texto válido' })
    @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres' })
    @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
    name!: string;

    @ApiProperty({
        description: 'Email do cliente',
        example: 'cliente@email.com',
        minLength: 5,
        maxLength: 100
    })
    @IsNotEmpty({ message: 'O email do cliente é obrigatório' })
    @IsEmail({}, { message: 'Digite um endereço de email válido (ex: cliente@dominio.com)' })
    @MinLength(5, { message: 'O email deve ter no mínimo 5 caracteres' })
    @MaxLength(100, { message: 'O email deve ter no máximo 100 caracteres' })
    email!: string;

    @ApiProperty({
        description: 'Número do cliente',
        example: '11999999999',
        minLength: 10,
        maxLength: 11
    })
    @IsNotEmpty({ message: 'O número de telefone é obrigatório' })
    @IsString({ message: 'O telefone deve ser um texto válido' })
    @MinLength(10, { message: 'O telefone deve ter no mínimo 10 dígitos (DDD + número)' })
    @MaxLength(11, { message: 'O telefone deve ter no máximo 11 dígitos (DDD + número com 9 dígitos)' })
    phone_number!: string;

    @ApiProperty({
        description: 'Id do serviço',
        example: 1,
    })
    @IsNotEmpty({ message: 'O ID do serviço é obrigatório' })
    @IsNumber({}, { message: 'O ID do serviço deve ser um número válido' })
    service_id!: number;

    @ApiProperty({
        description: 'Data do agendamento',
        example: '2026-06-15',
    })
    @IsNotEmpty({ message: 'A data do agendamento é obrigatória' })
    @IsDateString({}, { message: 'A data deve estar no formato válido (YYYY-MM-DD)' })
    appointment_date!: string;

    @ApiProperty({
        description: 'Id do horário selecionado para realização do serviço',
        example: 1,
    })
    @IsNotEmpty({ message: 'O ID do horário é obrigatório' })
    @IsNumber({}, { message: 'O ID do horário deve ser um número válido' })
    hour_id!: number;

    @ApiProperty({
        description: 'Tipo de pagamento',
        example: 'pix',
        enum: AppointmentPayment
    })
    @IsNotEmpty({ message: 'O tipo de pagamento é obrigatório' })
    @IsString({ message: 'O tipo de pagamento deve ser um texto válido' })
    @IsEnum(AppointmentPayment, {
        message: 'Tipo de pagamento inválido. Valores permitidos: pix, crédito, débito, dinheiro'
    })
    payment_type!: AppointmentPayment;
}