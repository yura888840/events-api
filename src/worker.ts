import { NestFactory } from '@nestjs/core';
import { NotificationsModule } from './modules/notifications/notifications.module.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(
    NotificationsModule,
  );

  app.enableShutdownHooks();
}

await bootstrap();