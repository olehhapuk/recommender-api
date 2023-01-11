import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { CORS_ORIGIN } = process.env;
  if (CORS_ORIGIN) {
    app.enableCors({
      origin: CORS_ORIGIN === '*' ? CORS_ORIGIN : CORS_ORIGIN.split(','),
    });
  }

  const config = new DocumentBuilder()
    .setTitle('Recommender API')
    .setDescription('The recommender app API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT);
}
bootstrap();
