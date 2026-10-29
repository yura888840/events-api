import { describe, expect, it, vi } from 'vitest';
import { DeleteEventUseCase } from './delete-event.use-case.js';
import type { EventRepository } from '../port/repository/events_repository.js';

describe('DeleteEventUseCase', () => {
  it('deletes event by id through repository', async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    const repository: EventRepository = {
      getById: vi.fn(),
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: remove,
    };

    const useCase = new DeleteEventUseCase(repository);

    await expect(useCase.execute('event-1')).resolves.toBeUndefined();
    expect(remove).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledWith('event-1');
  });
});
