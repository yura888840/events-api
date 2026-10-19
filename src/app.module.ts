import { Module } from '@nestjs/common';
import { EventsModule } from './modules/events/events.module.js';
import { createObserveModule } from '@nestjs/observe';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './config/mikro-orm.config.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'task-api',
    }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    EventsModule,
  ],
})
export class AppModule {}
