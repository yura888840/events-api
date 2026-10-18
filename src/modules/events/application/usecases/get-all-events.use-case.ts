import type { Event } from '../models/event.js';
import type { EventRepository } from '../port/repository/events_repository.js';

export class GetAllEventsUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(): Promise<Event[]> {
    return this.eventRepository.getAll();
  }
}
