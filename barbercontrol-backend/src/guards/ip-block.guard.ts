import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class IpBlockGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const clientIp = request.ip

        const blocked = await this.prisma.clients_blocked.findFirst({
            where: {
                ip: clientIp
            }
        })

        if (blocked) {
            throw new ForbiddenException({
                message: 'Você tem pendências com o estabelecimento',
                reason: blocked.reason,
                blockedSince: blocked.created_at
            })
        }

        return true
    }
}