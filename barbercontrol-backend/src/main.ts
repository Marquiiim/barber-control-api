import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  process.env.TZ = 'America/Sao_Paulo'

  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.set('trust proxy', 1)

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: true,
    exceptionFactory: (errors) => {
      return new BadRequestException({
        message: Object.values(errors[0].constraints)[0],
        error: 'Bad Request',
        statusCode: 400,
        field: errors[0].property
      })
    }
  }))

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.headers.origin === 'http://localhost:5173') {
      res.header('Access-Control-Allow-Origin', req.headers.origin)
      res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH, OPTIONS')
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return next()
    }

    if (req.headers.origin === 'http://localhost:5174') {
      const allowedMethods = ['GET', 'POST', 'DELETE']

      if (!allowedMethods.includes(req.method)) {
        return res.status(403).json({
          error: 'Método não permitido'
        })
      }
      res.header('Access-Control-Allow-Origin', req.headers.origin)
      res.header('Access-Control-Allow-Methods', allowedMethods.join(', '))
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return next()
    }
    res.status(403).json({ error: 'Origem não permitida' })
  })

  const config = new DocumentBuilder()
    .setTitle('Barber Control API')
    .setDescription('API para controle de barbearia')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
