import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
require('dotenv').config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors();
  await app.listen(process.env.PORT);
  console.log('Listening on PORT', process.env.PORT, 'Worker started', process.pid);
}
bootstrap();
