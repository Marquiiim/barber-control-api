import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer"
import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsString, Length, Matches, Max } from "class-validator"

export class CreatePaymentDto {
    @ApiProperty({
        description: 'Valor da transação',
        example: 'Valor cobrado pelo sistema para pagar o serviço',
        minLength: 0.1,
        maxLength: 99999999.99
    })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O valor da transação inválido' })
    @IsNotEmpty({ message: 'Valor da transação é obrigatório' })
    @Max(99999999.99, { message: 'Valor da transação excede o limite máximo' })
    @Type(() => Number)
    transaction_amount: number;

    @ApiProperty({
        description: 'Descrição do pagamento',
        example: 'Gerado pela API automaticamente com serviço de valor',
        minLength: 1,
        maxLength: 255
    })
    @IsString({ message: 'Descrição deve ser uma string' })
    @IsNotEmpty({ message: 'Descrição é obrigatória' })
    @Length(1, 255, { message: 'Verifique o tamanho da descrição' })
    description: string;

    @ApiProperty({
        description: 'Tipo de pagamento',
        example: 'Só aceita pix'
    })
    @IsString({ message: 'Pagamento deve ser uma string' })
    @IsNotEmpty({ message: 'Pagamento é obrigatório' })
    @IsIn(['pix'], { message: 'Pagamento online, apenas pix' })
    payment_type: string;

    @ApiProperty({
        description: 'Email do cliente',
        example: 'teste@teste.com'
    })
    @IsEmail({}, { message: 'O email deve ser um email válido' })
    @IsNotEmpty({ message: 'Email é obrigatório' })
    @Matches(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/, { message: 'Formato do email inválido' })
    payer_email: string;

    @ApiProperty({
        description: 'Id do agendamento',
        example: '1'
    })
    @IsNumber({}, { message: 'Id do agendamento deve ser um número válido' })
    @IsNotEmpty({ message: 'Id do agendamento é obrigatório' })
    appointment_id: number;
}
