import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Logger } from '@nestjs/common';
import { globalErrors } from "./middlewares/globalErrors";

const logger = new Logger('bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.APP_PORT;
  const HOST = process.env.APP_HOST;

  app.use(globalErrors)
  await app.listen(PORT ?? 3000, () => {
    logger.log(`⚡️[server]: Server is running at ${HOST}:${PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.log('Unable to connect to the database', error);
});
