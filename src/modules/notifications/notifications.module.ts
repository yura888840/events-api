import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsProcessor } from './notifications.processor.js';
import { NotificationsService } from './notifications.service.js';
import { MikroOrmEventRepository } from '../events/application/infrastructure/persistence/event.repository.js';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from '../../config/mikro-orm.config.js';
import { EventReminderRepository } from './repository/event-reminder.repository.js';
import { TelegramService } from './telegram.service.js';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'notifications',
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
  ],
  providers: [
    NotificationsProcessor,
    NotificationsService,
    MikroOrmEventRepository,
    EventReminderRepository,
    TelegramService,
  ],
})
export class NotificationsModule {}
