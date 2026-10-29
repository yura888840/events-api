import { afterEach, describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@mikro-orm/core';
import type { Job } from 'bullmq';
import { NotificationsProcessor } from './notifications.processor.js';
import type { MikroORM } from '@mikro-orm/postgresql';
import type { NotificationsService } from './notifications.service.js';

describe('NotificationsProcessor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('processes "check-events" jobs inside request context', async () => {
    const em = {};
    const orm = { em } as MikroORM;
    const checkEvents = vi.fn().mockResolvedValue(undefined);
    const notificationsService = { checkEvents } as NotificationsService;

    const createSpy = vi
      .spyOn(RequestContext, 'create')
      .mockImplementation(async (_em, callback) => callback());

    const processor = new NotificationsProcessor(orm, notificationsService);

    await expect(
      processor.process({ name: 'check-events' } as Job),
    ).resolves.toBeUndefined();
    expect(createSpy).toHaveBeenCalledOnce();
    expect(createSpy).toHaveBeenCalledWith(em, expect.any(Function));
    expect(checkEvents).toHaveBeenCalledOnce();
  });

  it('throws for unknown jobs', async () => {
    const orm = { em: {} } as MikroORM;
    const notificationsService = {
      checkEvents: vi.fn(),
    } as NotificationsService;

    const createSpy = vi.spyOn(RequestContext, 'create');
    const processor = new NotificationsProcessor(orm, notificationsService);

    await expect(processor.process({ name: 'unknown' } as Job)).rejects.toThrow(
      'Unknown job: unknown',
    );
    expect(createSpy).not.toHaveBeenCalled();
    expect(notificationsService.checkEvents).not.toHaveBeenCalled();
  });
});
