import { Event } from '../../models/event.js';
import type { EventRepository } from '../../port/repository/events_repository.js';
import { CreateEventRequest } from './create-event.request.js';
import { randomUUID } from 'node:crypto';

export class CreateEventUseCase {
  constructor(private readonly eventRepository: EventRepository) {}
  async execute(request: CreateEventRequest): Promise<Event> {
    const event: Event = {
      id: randomUUID(),
      ...request,
    };
    return this.eventRepository.create(event);
  }
}
