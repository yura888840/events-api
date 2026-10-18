import type { Event } from '../../models/event.js';

interface EventRepository {
  getById(id: string): Promise<Event | null>;
  getAll(): Promise<Event[]>;
  create(event: Event): Promise<Event>;
  update(event: Partial<Event>): Promise<void>;
  delete(id: string): Promise<void>;
}

export type { EventRepository };
