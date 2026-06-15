import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

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

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE']
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
