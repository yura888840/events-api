import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationsService } from './notifications.service.js';
import type { Event } from '../events/application/models/event.js';
import type { MikroOrmEventRepository } from '../events/application/infrastructure/repository/mikro-orm.event.repository.js';
import type { EventReminderRepository } from './repository/event-reminder.repository.js';
import type { TelegramService } from './telegram.service.js';

function createService({
  events,
  hasBeenSent = vi.fn().mockResolvedValue(false),
  markAsSent = vi.fn().mockResolvedValue(undefined),
  sendMessage = vi.fn().mockResolvedValue(undefined),
}: {
  events: Event[];
  hasBeenSent?: ReturnType<typeof vi.fn>;
  markAsSent?: ReturnType<typeof vi.fn>;
  sendMessage?: ReturnType<typeof vi.fn>;
}) {
  const getAll = vi.fn().mockResolvedValue(events);

  const eventRepository = {
    getAll,
  } as unknown as MikroOrmEventRepository;

  const reminderRepository = {
    hasBeenSent,
    markAsSent,
  } as unknown as EventReminderRepository;

  const telegramService = {
    sendMessage,
  } as unknown as TelegramService;

  const service = new NotificationsService(
    eventRepository,
    reminderRepository,
    telegramService,
  );

  return {
    service,
    getAll,
    hasBeenSent,
    markAsSent,
    sendMessage,
  };
}

describe('NotificationsService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('sends reminders for active events matching +2 and +3 day schedules', async () => {
    vi.setSystemTime(new Date('2026-05-10T12:00:00.000Z'));

    const events: Event[] = [
      {
        id: 'event-yearly',
        name: 'Birthday',
        description: 'Buy a present',
        month: 5,
        day: 12,
        type: 'birthday',
        recurrence: 'yearly',
        isActive: true,
      },
      {
        id: 'event-once',
        name: 'Doctor visit',
        description: 'Bring documents',
        year: 2026,
        month: 5,
        day: 13,
        type: 'other',
        recurrence: 'none',
        isActive: true,
      },
    ];

    const { service, getAll, hasBeenSent, sendMessage, markAsSent } =
      createService({ events });

    await service.checkEvents();

    expect(getAll).toHaveBeenCalledOnce();

    expect(hasBeenSent).toHaveBeenCalledTimes(2);
    expect(hasBeenSent).toHaveBeenNthCalledWith(
      1,
      'event-yearly',
      '2026-05-12',
      2,
    );
    expect(hasBeenSent).toHaveBeenNthCalledWith(2, 'event-once', '2026-05-13', 3);

    expect(sendMessage).toHaveBeenCalledTimes(2);
    expect(sendMessage).toHaveBeenNthCalledWith(
      1,
      'Напоминание: Birthday\nЧерез 2 дня — 2026-05-12\nBuy a present',
    );
    expect(sendMessage).toHaveBeenNthCalledWith(
      2,
      'Напоминание: Doctor visit\nЧерез 3 дня — 2026-05-13\nBring documents',
    );

    expect(markAsSent).toHaveBeenCalledTimes(2);
    expect(markAsSent).toHaveBeenNthCalledWith(1, 'event-yearly', '2026-05-12', 2);
    expect(markAsSent).toHaveBeenNthCalledWith(2, 'event-once', '2026-05-13', 3);
  });

  it('skips sending when reminder has already been sent', async () => {
    vi.setSystemTime(new Date('2026-05-10T12:00:00.000Z'));

    const { service, hasBeenSent, sendMessage, markAsSent } = createService({
      events: [
        {
          id: 'event-1',
          name: 'Birthday',
          description: 'Buy a present',
          month: 5,
          day: 12,
          type: 'birthday',
          recurrence: 'yearly',
          isActive: true,
        },
      ],
      hasBeenSent: vi.fn().mockResolvedValue(true),
    });

    await service.checkEvents();

    expect(hasBeenSent).toHaveBeenCalledOnce();
    expect(sendMessage).not.toHaveBeenCalled();
    expect(markAsSent).not.toHaveBeenCalled();
  });

  it('ignores inactive, non-matching, and wrong-year one-time events', async () => {
    vi.setSystemTime(new Date('2026-05-10T12:00:00.000Z'));

    const { service, hasBeenSent, sendMessage, markAsSent } = createService({
      events: [
        {
          id: 'inactive',
          name: 'Inactive',
          description: '',
          month: 5,
          day: 12,
          type: 'other',
          recurrence: 'yearly',
          isActive: false,
        },
        {
          id: 'wrong-day',
          name: 'Wrong day',
          description: '',
          month: 5,
          day: 20,
          type: 'other',
          recurrence: 'yearly',
          isActive: true,
        },
        {
          id: 'wrong-year',
          name: 'Wrong year',
          description: '',
          year: 2025,
          month: 5,
          day: 13,
          type: 'other',
          recurrence: 'none',
          isActive: true,
        },
      ],
    });

    await service.checkEvents();

    expect(hasBeenSent).not.toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
    expect(markAsSent).not.toHaveBeenCalled();
  });

  it('formats reminder dates as YYYY-MM-DD and omits empty description lines', async () => {
    vi.setSystemTime(new Date('2026-01-07T12:00:00.000Z'));

    const { service, hasBeenSent, sendMessage, markAsSent } = createService({
      events: [
        {
          id: 'event-padded-date',
          name: 'Padded date event',
          description: '',
          month: 1,
          day: 9,
          type: 'other',
          recurrence: 'yearly',
          isActive: true,
        },
      ],
    });

    await service.checkEvents();

    expect(hasBeenSent).toHaveBeenCalledExactlyOnceWith(
      'event-padded-date',
      '2026-01-09',
      2,
    );
    expect(sendMessage).toHaveBeenCalledExactlyOnceWith(
      'Напоминание: Padded date event\nЧерез 2 дня — 2026-01-09',
    );
    expect(markAsSent).toHaveBeenCalledExactlyOnceWith(
      'event-padded-date',
      '2026-01-09',
      2,
    );
  });
});
