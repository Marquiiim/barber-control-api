import { applyDecorators, Type } from "@nestjs/common"
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger"

export enum EndpointType {
    GET_ALL = 'getAll',
    GET_BY_ID = 'getById',
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete'
}

export function ApiCrudEndpoint<T extends Type<any>>(
    type: EndpointType,
    entity: T,
    name: string,
    options?: {
        isAuth?: boolean
        hasPagination?: boolean
        customSummary?: string
    }
) {
    const decorators = []

    if (options?.isAuth) decorators.push(ApiBearerAuth())

    switch (type) {
        case EndpointType.GET_ALL:
            decorators.push(
                ApiOperation({
                    summary: options?.customSummary || `Listar todos os ${name}s`,
                    description: `Retorna uma lista com todos os ${name}s cadastrados`
                }),
                ApiResponse({
                    status: 200,
                    description: `Lista de ${name}s retornada com sucesso`,
                    type: [entity]
                })
            );

            if (options?.hasPagination) {
                decorators.push(
                    ApiQuery({ name: 'page', required: false, example: 1 }),
                    ApiQuery({ name: 'limit', required: false, example: 10 })
                );
            }
            break;

        case EndpointType.GET_BY_ID:
            decorators.push(
                ApiOperation({
                    summary: options?.customSummary || `Buscar ${name} por ID`,
                    description: `Retorna os dados de um ${name} específico`
                }),
                ApiParam({ name: 'id', description: `ID do ${name}`, example: 1 }),
                ApiResponse({
                    status: 200,
                    description: `${name} encontrado com sucesso`,
                    type: entity
                }),
                ApiResponse({
                    status: 404,
                    description: `${name} não encontrado`
                })
            );
            break;

        case EndpointType.CREATE:
            decorators.push(
                ApiOperation({
                    summary: options?.customSummary || `Criar um novo ${name}`,
                    description: `Cadastra um novo ${name} no sistema`
                }),
                ApiResponse({
                    status: 201,
                    description: `${name} criado com sucesso`,
                    type: entity
                }),
                ApiResponse({
                    status: 400,
                    description: 'Dados inválidos'
                })
            );
            break;

        case EndpointType.UPDATE:
            decorators.push(
                ApiOperation({
                    summary: options?.customSummary || `Atualizar ${name}`,
                    description: `Atualiza os dados de um ${name} existente`
                }),
                ApiParam({ name: 'id', description: `ID do ${name}`, example: 1 }),
                ApiResponse({
                    status: 200,
                    description: `${name} atualizado com sucesso`,
                    type: entity
                }),
                ApiResponse({
                    status: 404,
                    description: `${name} não encontrado`
                })
            );
            break;

        case EndpointType.DELETE:
            decorators.push(
                ApiOperation({
                    summary: options?.customSummary || `Deletar ${name}`,
                    description: `Remove um ${name} do sistema`
                }),
                ApiParam({ name: 'id', description: `ID do ${name}`, example: 1 }),
                ApiResponse({
                    status: 200,
                    description: `${name} deletado com sucesso`
                }),
                ApiResponse({
                    status: 404,
                    description: `${name} não encontrado`
                })
            );
            break;
    }

    decorators.push(
        ApiResponse({ status: 500, description: 'Erro interno no servidor' })
    )

    return applyDecorators(...decorators)
}