import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { CORS_ORIGIN } = process.env;
  if (CORS_ORIGIN) {
    app.enableCors({
      origin: CORS_ORIGIN === '*' ? CORS_ORIGIN : CORS_ORIGIN.split(','),
    });
  }
  await app.listen(process.env.PORT);
}
bootstrap();
