export type EventType = 'birthday' | 'other';
export type EventRecurrence = 'yearly' | 'none';

type Event = {
  id: string;
  name: string;
  description: string;
  year?: number;
  month: number;
  day: number;
  type: EventType;
  recurrence: EventRecurrence;
  isActive: boolean;
};

export type { Event };
