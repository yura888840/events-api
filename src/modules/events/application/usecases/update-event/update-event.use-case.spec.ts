import { describe, expect, it, vi } from 'vitest';
import { NotFoundError } from 'rxjs';
import {
  UpdateEventUseCase,
  type UpdateEventRequest,
} from './update-event.use-case.js';
import type { Event } from '../../models/event.js';
import type { EventRepository } from '../../port/repository/events_repository.js';

describe('UpdateEventUseCase', () => {
  it('updates existing event with provided changes', async () => {
    const existingEvent: Event = {
      id: 'event-1',
      name: 'Birthday',
      description: 'Buy a present',
      month: 7,
      day: 4,
      type: 'birthday',
      recurrence: 'yearly',
      isActive: true,
    };

    const getById = vi.fn().mockResolvedValue(existingEvent);
    const update = vi.fn().mockResolvedValue(undefined);
    const repository: EventRepository = {
      getById,
      update,
      getAll: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new UpdateEventUseCase(repository);
    const request: UpdateEventRequest = {
      id: 'event-1',
      changes: {
        name: 'Anniversary',
        recurrence: 'none',
      },
    };

    await expect(useCase.execute(request)).resolves.toEqual({
      ...existingEvent,
      name: 'Anniversary',
      recurrence: 'none',
      id: 'event-1',
    });
    expect(getById).toHaveBeenCalledOnce();
    expect(getById).toHaveBeenCalledWith('event-1');
    expect(update).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledWith({
      ...existingEvent,
      name: 'Anniversary',
      recurrence: 'none',
      id: 'event-1',
    });
  });

  it('throws NotFoundError when event does not exist', async () => {
    const getById = vi.fn().mockResolvedValue(null);
    const update = vi.fn();
    const repository: EventRepository = {
      getById,
      update,
      getAll: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new UpdateEventUseCase(repository);

    const execution = useCase.execute({
      id: 'missing-id',
      changes: { name: 'Updated' },
    });

    await expect(execution).rejects.toBeInstanceOf(NotFoundError);
    await expect(execution).rejects.toThrow(
      'Event with id "missing-id" not found',
    );
    expect(getById).toHaveBeenCalledOnce();
    expect(getById).toHaveBeenCalledWith('missing-id');
    expect(update).not.toHaveBeenCalled();
  });
});
