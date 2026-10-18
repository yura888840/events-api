import type { CreateEventRequest } from '../create-event/create-event.request.js';

export interface UpdateEventRequest {
  id: string;
  changes: Partial<CreateEventRequest>;
}
