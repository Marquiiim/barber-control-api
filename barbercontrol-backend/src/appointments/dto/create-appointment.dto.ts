import { MinLength, MaxLength, IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator'

export class CreateAppointmentDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3, { message: 'Nome de cliente muito curto' })
    @MaxLength(100, { message: 'Nome de cliente muito longo' })
    name!: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(12, { message: 'Telefone deve ter no máximo 12 caracteres' })
    phone_number!: string;

    @IsNotEmpty()
    @IsNumber()
    service_id!: number;

    @IsNotEmpty()
    @IsDateString()
    appointment_date!: string;

    @IsNotEmpty()
    @IsNumber()
    time_id!: number
}
