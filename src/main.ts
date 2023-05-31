import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './database/datasource.config';

AppDataSource.initialize()
  .then(() => {
    async function bootstrap() {
      const app = await NestFactory.create(AppModule);
      const PORT = process.env.APP_PORT;
      const HOST = process.env.APP_HOST;

      await app.listen(PORT ?? 3000, () => {
        console.log(`⚡️[server]: Server is running at ${HOST}:${PORT}`);
      });
    }
    bootstrap();
  })
  .catch((error) => {
    console.log('Unable to connect to the database', error);
  });
