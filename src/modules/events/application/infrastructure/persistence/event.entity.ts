import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'events' })
export class EventEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'text' })
  description!: string;

  @Property({ type: 'integer', nullable: true })
  year: number | null = null;

  @Property({ type: 'integer' })
  month!: number;

  @Property({ type: 'integer' })
  day!: number;

  @Property({ type: 'string' })
  type!: 'birthday' | 'other';

  @Property({ type: 'string' })
  recurrence!: 'yearly' | 'none';

  @Property({ type: 'boolean' })
  isActive!: boolean;
}
