import { Event } from '../../models/event.js';
import type { EventRepository } from '../../port/repository/events_repository.js';
import { randomUUID } from 'node:crypto';

export interface CreateEventRequest {
  name: string;
  description: string;
  year?: number;
  month: number;
  day: number;
  type: 'birthday' | 'other';
  recurrence: 'yearly' | 'none';
  isActive: boolean;
}

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
