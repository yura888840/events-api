import { describe, expect, it, vi } from 'vitest';
import { GetAllEventsUseCase } from './get-all-events.use-case.js';
import type { Event } from '../models/event.js';
import type { EventRepository } from '../port/repository/events_repository.js';

describe('GetAllEventsUseCase', () => {
  it('returns all events from repository', async () => {
    const events: Event[] = [
      {
        id: 'event-1',
        name: 'Birthday',
        description: 'Buy a present',
        month: 7,
        day: 4,
        type: 'birthday',
        recurrence: 'yearly',
        isActive: true,
      },
    ];

    const getAll = vi.fn().mockResolvedValue(events);
    const repository: EventRepository = {
      getAll,
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GetAllEventsUseCase(repository);

    await expect(useCase.execute()).resolves.toEqual(events);
    expect(getAll).toHaveBeenCalledOnce();
    expect(getAll).toHaveBeenCalledWith();
  });
});
