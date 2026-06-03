import { Type } from "class-transformer"
import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsString, Length, Matches, Max } from "class-validator"

export class CreatePaymentDto {
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O valor da transação inválido' })
    @IsNotEmpty({ message: 'Valor da transação é obrigatório' })
    @Max(99999999.99, { message: 'Valor da transação excede o limite máximo' })
    @Type(() => Number)
    transaction_amount: number;

    @IsString({ message: 'Descrição deve ser uma string' })
    @IsNotEmpty({ message: 'Descrição é obrigatória' })
    @Length(1, 255, { message: 'Verifique o tamanho da descrição' })
    description: string;

    @IsString({ message: 'Pagamento deve ser uma string' })
    @IsNotEmpty({ message: 'Pagamento é obrigatório' })
    @IsIn(['pix'], { message: 'Pagamento online, apenas pix' })
    payment_type: string;

    @IsEmail({}, { message: 'O email deve ser um email válido' })
    @IsNotEmpty({ message: 'Email é obrigatório' })
    @Matches(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/, { message: 'Formato do email inválido' })
    payer_email: string;

    @IsNumber({}, { message: 'Id do agendamento deve ser um número válido' })
    @IsNotEmpty({ message: 'Id do agendamento é obrigatório' })
    appointment_id: number;
}
