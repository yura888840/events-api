import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';

import type { Event } from '../../models/event.js';
import type { EventRepository } from '../../port/repository/events_repository.js';
import { EventEntity } from './event.entity.js';

@Injectable()
export class MikroOrmEventRepository implements EventRepository {
  constructor(private readonly em: EntityManager) {}

  async getById(id: string): Promise<Event | null> {
    const entity = await this.em.findOne(EventEntity, { id });

    return entity === null ? null : this.toDomain(entity);
  }

  async getAll(): Promise<Event[]> {
    const entities = await this.em.find(EventEntity, {});

    return entities.map((entity) => this.toDomain(entity));
  }

  async create(event: Event): Promise<Event> {
    const existing = await this.em.findOne(EventEntity, {
      id: event.id,
    });

    if (existing !== null) {
      throw new Error('Already has element with given ID');
    }

    const entity = new EventEntity();
    Object.assign(entity, this.toPersistence(event));

    this.em.persist(entity);
    await this.em.flush();

    return event;
  }

  async update(event: Event): Promise<void> {
    const entity = await this.em.findOne(EventEntity, {
      id: event.id,
    });

    if (entity === null) {
      throw new Error('Not found.');
    }

    Object.assign(entity, this.toPersistence(event));

    await this.em.flush();
  }

  async delete(id: string): Promise<void> {
    const entity = await this.em.findOne(EventEntity, { id });

    if (entity === null) {
      return;
    }

    this.em.remove(entity);
    await this.em.flush();
  }

  private toDomain(entity: EventEntity): Event {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      ...(entity.year !== null ? { year: entity.year } : {}),
      month: entity.month,
      day: entity.day,
      type: entity.type,
      recurrence: entity.recurrence,
      isActive: entity.isActive,
    };
  }

  private toPersistence(event: Event): EventEntity {
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      year: event.year ?? null,
      month: event.month,
      day: event.day,
      type: event.type,
      recurrence: event.recurrence,
      isActive: event.isActive,
    };
  }
}
