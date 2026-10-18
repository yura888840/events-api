import { Injectable } from '@nestjs/common';
import type { Event } from '../../models/event.js';
import type { EventRepository } from '../../port/repository/events_repository.js';

@Injectable()
export class InMemoryEventRepository implements EventRepository {
  private readonly events: Map<string, Event> = new Map();

  async getById(id: string): Promise<Event | null> {
    const event = this.events.get(id);

    return event === undefined ? null : { ...event };
  }
  async getAll(): Promise<Event[]> {
    return Array.from(this.events.values(), (event) => ({ ...event }));
  }

  async create(event: Event): Promise<Event> {
    if (this.events.has(event.id)) {
      throw new Error('Already has element with given ID');
    }
    this.events.set(event.id, { ...event });

    return event;
  }

  // нужно обновить только нужные поля
  async update(event: Event): Promise<void> {
    if (!this.events.has(event.id)) {
      throw new Error('Not found.');
    }

    this.events.set(event.id, { ...event });
  }

  async delete(id: string): Promise<void> {
    this.events.delete(id);
  }
}
