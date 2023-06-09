import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './modules/app.module';
import { HttpStatus, Logger } from '@nestjs/common';
import { globalErrors } from './middlewares/globalErrors';
import { AppError } from './error/AppError';

const logger = new Logger('bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.APP_PORT;
  const HOST = process.env.APP_HOST;

  const config = new DocumentBuilder()
    .setTitle('Swing Trade')
    .setDescription(
      'Registration of purchase and sale of shares and calculation of darf',
    )
    .setVersion('1.0.0')
    .addTag('swing-trade')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  app.use(globalErrors);
  await app.listen(PORT ?? 3000, () => {
    logger.log(`⚡️[server]: Server is running at ${HOST}:${PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error('Unable to connect to the database', error);
  throw new AppError(
    'Unable to connect to the database',
    HttpStatus.INTERNAL_SERVER_ERROR,
    error,
  );
});
