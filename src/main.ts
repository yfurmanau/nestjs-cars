import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieSession = require('cookie-session');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    cookieSession({
      keys: ['secret'],
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      // doesn't allow to pass other properties through body
      // for security reason
      whitelist: true,
    }),
  );
  await app.listen(3000);
}

bootstrap().then();
