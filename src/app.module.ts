import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
// import { InMemoryEventRepository } from './application/infrastructure/repository/in-memory-event-repository.js';
// import { EVENT_REPOSITORY } from './events.tokens.js'
import { EventsModule } from './modules/events/events.module.js';
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
    EventsModule,
    MikroOrmModule.forRoot(mikroOrmConfig),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: EVENT_REPOSITORY,
    //   useClass: InMemoryEventRepository,
    // }
  ],
})
export class AppModule {}
