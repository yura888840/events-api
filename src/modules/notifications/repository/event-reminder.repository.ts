import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';

import {
  Entity,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'event_reminders' })
@Unique({
  properties: ['eventId', 'occurrenceDate', 'daysBefore'],
})
export class EventReminderEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid' })
  eventId!: string;

  @Property({ type: 'date' })
  occurrenceDate!: string;

  @Property({ type: 'integer' })
  daysBefore!: number;

  @Property({ type: 'datetime' })
  sentAt!: Date;
}

@Injectable()
export class EventReminderRepository {
  constructor(private readonly em: EntityManager) {}

  async hasBeenSent(
    eventId: string,
    occurrenceDate: string,
    daysBefore: number,
  ): Promise<boolean> {
    const reminder = await this.em.findOne(EventReminderEntity, {
      eventId,
      occurrenceDate,
      daysBefore,
    });

    return reminder !== null;
  }

  async markAsSent(
    eventId: string,
    occurrenceDate: string,
    daysBefore: number,
  ): Promise<void> {
    const reminder = new EventReminderEntity();

    reminder.id = randomUUID();
    reminder.eventId = eventId;
    reminder.occurrenceDate = occurrenceDate;
    reminder.daysBefore = daysBefore;
    reminder.sentAt = new Date();

    this.em.persist(reminder);
    await this.em.flush();
  }
}
