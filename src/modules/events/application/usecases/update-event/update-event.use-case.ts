import { NotFoundError } from 'rxjs';
import { Event } from '../../models/event.js';
import type { EventRepository } from '../../port/repository/events_repository.js';
import type { CreateEventRequest } from '../create-event/create-event.request.js';

export interface UpdateEventRequest {
  id: string;
  changes: Partial<CreateEventRequest>;
}

export class UpdateEventUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(request: UpdateEventRequest): Promise<Event> {
    const existingEvent = await this.eventRepository.getById(request.id);

    if (existingEvent === null) {
      throw new NotFoundError(`Event with id "${request.id}" not found`);
    }

    const updatedEvent: Event = {
      ...existingEvent,
      ...request.changes,
      id: existingEvent.id,
    };

    await this.eventRepository.update(updatedEvent);

    return updatedEvent;
  }
}
