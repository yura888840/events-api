import { Event } from '../models/event.js';
import type { EventRepository } from '../port/repository/events_repository.js';

export class GetOneByIdUseCase {
  constructor(private readonly eventRepository: EventRepository) {}
  async execute(id: string): Promise<Event | null> {
    return this.eventRepository.getById(id);
  }
}
