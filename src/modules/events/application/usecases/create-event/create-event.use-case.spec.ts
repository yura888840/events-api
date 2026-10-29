import { describe, expect, it, vi } from 'vitest';
import { CreateEventUseCase, type CreateEventRequest } from './create-event.use-case.js';
import type { Event } from '../../models/event.js';
import type { EventRepository } from '../../port/repository/events_repository.js';

vi.mock('node:crypto', () => ({
  randomUUID: vi.fn(() => 'generated-uuid'),
}));

describe('CreateEventUseCase', () => {
  it('creates event with generated id and saves it through repository', async () => {
    const request: CreateEventRequest = {
      name: 'Birthday',
      description: 'Buy a present',
      month: 7,
      day: 4,
      type: 'birthday',
      recurrence: 'yearly',
      isActive: true,
    };

    const createdEvent: Event = {
      id: 'generated-uuid',
      ...request,
    };

    const create = vi.fn().mockResolvedValue(createdEvent);
    const repository: EventRepository = {
      create,
      getById: vi.fn(),
      getAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new CreateEventUseCase(repository);

    await expect(useCase.execute(request)).resolves.toEqual(createdEvent);
    expect(create).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith({
      id: 'generated-uuid',
      ...request,
    });
  });
});
