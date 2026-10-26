import { z } from 'zod';
import { createEventBodySchema } from '../create-event/create-event.schema.js';
import type { UpdateEventRequest } from './update-event.use-case.js';

export const updateEventBodySchema = createEventBodySchema
  .extend({
    description: z.string(),
    isActive: z.boolean(),
  })
  .partial()
  .strict()
  .refine((changes) => Object.keys(changes).length > 0, {
    message: 'Required at least one field for update',
  });

export const updateEventRequestSchema = z
  .object({
    id: z.string().uuid(),
    body: updateEventBodySchema,
  })
  .transform(({ id, body }): UpdateEventRequest => ({
    id,
    changes: body,
  }));
