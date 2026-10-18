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
