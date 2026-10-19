import { NestFactory } from '@nestjs/core';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationsModule } from './modules/notifications/notifications.module.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(NotificationsModule);

  app.enableShutdownHooks();

  const queue = app.get<Queue>(getQueueToken('notifications'));

  await queue.upsertJobScheduler(
    'check-events-scheduler',
    {
      every: 10_000,
    },
    {
      name: 'check-events',
      data: {},
      opts: {
        removeOnComplete: 20,
        removeOnFail: 50,
      },
    },
  );
}

await bootstrap();
