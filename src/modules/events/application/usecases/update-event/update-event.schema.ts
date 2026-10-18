import { z } from 'zod';
import { createEventBodySchema } from '../create-event/create-event.schema.js';
import type { UpdateEventRequest } from './update-event.request.js';

export const updateEventBodySchema = createEventBodySchema
  .extend({
    description: z.string(), // без default('')
    isActive: z.boolean(), // без default(true)
  })
  .partial()
  .strict()
  .refine((changes) => Object.keys(changes).length > 0, {
    message: 'Передай хотя бы одно поле для обновления',
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
