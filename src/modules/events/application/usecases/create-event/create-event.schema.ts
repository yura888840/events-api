import { z } from 'zod';
import type { CreateEventRequest } from './create-event.use-case.js';

export const createEventBodySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().default(''),
  year: z.number().int().min(1900).max(2040).optional(),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  type: z.enum(['birthday', 'other']),
  recurrence: z.enum(['yearly', 'none']),
  isActive: z.boolean().default(true),
});

export const createEventRequestSchema = createEventBodySchema.transform(
  (data): CreateEventRequest => ({
    name: data.name,
    description: data.description,
    ...(data.year !== undefined ? { year: data.year } : {}),
    month: data.month,
    day: data.day,
    type: data.type,
    recurrence: data.recurrence,
    isActive: data.isActive,
  }),
);
