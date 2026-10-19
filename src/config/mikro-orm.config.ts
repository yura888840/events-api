import { defineConfig } from '@mikro-orm/postgresql';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { Migrator } from '@mikro-orm/migrations';

import { EventEntity } from '../modules/events/application/infrastructure/persistence/event.entity.js';
import { EventReminderEntity } from '../modules/notifications/repository/event-reminder.repository.js';

export default defineConfig({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 5433),
  user: process.env.DB_USER ?? 'reminders',
  password: process.env.DB_PASSWORD ?? 'local_dev_password',
  dbName: process.env.DB_NAME ?? 'reminders',

  entities: [EventEntity, EventReminderEntity],
  metadataProvider: ReflectMetadataProvider,

  extensions: [Migrator],
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },
});
