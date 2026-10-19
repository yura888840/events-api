import { Module } from '@nestjs/common';
import { InMemoryEventRepository } from './application/infrastructure/repository/in-memory-event-repository.js';
import { EVENT_REPOSITORY } from './events.tokens.js';
import { GetAllEventsUseCase } from './application/usecases/get-all-events.use-case.js';
import { GetOneByIdUseCase } from './application/usecases/get-one-by-id.use-case.js';
import { CreateEventUseCase } from './application/usecases/create-event/create-event.use-case.js';
import { UpdateEventUseCase } from './application/usecases/update-event/update-event.use-case.js';
import { DeleteEventUseCase } from './application/usecases/delete-event.use-case.js';
import { EventRepository } from './application/port/repository/events_repository.js';
import { EventsController } from './controller/events.controller.js';
import { MikroOrmEventRepository } from './application/infrastructure/persistence/event.repository.js';

@Module({
  controllers: [EventsController],
  providers: [
    {
      provide: EVENT_REPOSITORY,
      //useClass: InMemoryEventRepository,
      useClass: MikroOrmEventRepository,
    },
    {
      provide: GetAllEventsUseCase,
      useFactory: (repository: EventRepository) =>
        new GetAllEventsUseCase(repository),
      inject: [EVENT_REPOSITORY],
    },
    {
      provide: GetOneByIdUseCase,
      useFactory: (repository: EventRepository) =>
        new GetOneByIdUseCase(repository),
      inject: [EVENT_REPOSITORY],
    },
    {
      provide: CreateEventUseCase,
      useFactory: (repository: EventRepository) =>
        new CreateEventUseCase(repository),
      inject: [EVENT_REPOSITORY],
    },
    {
      provide: UpdateEventUseCase,
      useFactory: (repository: EventRepository) =>
        new UpdateEventUseCase(repository),
      inject: [EVENT_REPOSITORY],
    },
    {
      provide: DeleteEventUseCase,
      useFactory: (repository: EventRepository) =>
        new DeleteEventUseCase(repository),
      inject: [EVENT_REPOSITORY],
    },
  ],
})
export class EventsModule {}
