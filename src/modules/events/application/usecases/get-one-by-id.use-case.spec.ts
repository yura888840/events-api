import { describe, expect, it, vi } from 'vitest';
import { GetOneByIdUseCase } from './get-one-by-id.use-case.js';
import type { Event } from '../models/event.js';
import type { EventRepository } from '../port/repository/events_repository.js';

describe('GetOneByIdUseCase', () => {
  it('returns event from repository by id', async () => {
    const event: Event = {
      id: 'event-1',
      name: 'Birthday',
      description: 'Buy a present',
      month: 7,
      day: 4,
      type: 'birthday',
      recurrence: 'yearly',
      isActive: true,
    };

    const getById = vi.fn().mockResolvedValue(event);
    const repository: EventRepository = {
      getById,
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GetOneByIdUseCase(repository);

    await expect(useCase.execute('event-1')).resolves.toEqual(event);
    expect(getById).toHaveBeenCalledOnce();
    expect(getById).toHaveBeenCalledWith('event-1');
  });

  it('returns null when repository does not find an event', async () => {
    const getById = vi.fn().mockResolvedValue(null);
    const repository: EventRepository = {
      getById,
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GetOneByIdUseCase(repository);

    await expect(useCase.execute('missing-id')).resolves.toBeNull();
    expect(getById).toHaveBeenCalledOnce();
    expect(getById).toHaveBeenCalledWith('missing-id');
  });
});
