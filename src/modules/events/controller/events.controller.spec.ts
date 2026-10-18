import { Test } from '@nestjs/testing';
import { describe, it, expect, vi } from 'vitest';
import { EventsController } from './events.controller.js';
import { GetAllEventsUseCase } from '../application/usecases/get-all-events.use-case.js';
import type { Event } from '../application/models/event.js';
import { GetOneByIdUseCase } from '../application/usecases/get-one-by-id.use-case.js';
import { NotFoundException } from '@nestjs/common';
import { CreateEventUseCase } from '../application/usecases/create-event/create-event.use-case.js';
import { UpdateEventUseCase } from '../application/usecases/update-event/update-event.use-case.js';
import { DeleteEventUseCase } from '../application/usecases/delete-event.use-case.js';

describe('EventsController', () => {
  it('returns events provided by the use case for list of all events', async () => {
    // Arrange: подготавливаем данные и зависимости
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

    const useCaseMock = {
      execute: vi.fn().mockResolvedValue(events),
    };

    const useCaseFindOneMock = {
      execute: vi.fn().mockRejectedValueOnce(null),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: GetAllEventsUseCase,
          useValue: useCaseMock,
        },
        {
          provide: GetOneByIdUseCase,
          useValue: useCaseFindOneMock,
        },
        {
          provide: CreateEventUseCase,
          useValue: useCaseMock,
        },
        {
          provide: UpdateEventUseCase,
          useValue: useCaseMock,
        },
        {
          provide: DeleteEventUseCase,
          useValue: useCaseMock,
        },
      ],
    }).compile();

    const controller = moduleRef.get(EventsController);

    try {
      const result = await controller.getAll();

      expect(result).toEqual(events);
      expect(useCaseMock.execute).toHaveBeenCalledTimes(1);
      expect(useCaseMock.execute).toHaveBeenCalledWith();
    } finally {
      await moduleRef.close();
    }
  });

  it('throws NotFoundException when event is not found', async () => {
    const useCaseMock = {
      execute: vi.fn(),
    };

    const useCaseFindOneMock = {
      execute: vi.fn().mockResolvedValueOnce(null),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: GetAllEventsUseCase,
          useValue: useCaseMock,
        },
        {
          provide: GetOneByIdUseCase,
          useValue: useCaseFindOneMock,
        },
        {
          provide: CreateEventUseCase,
          useValue: useCaseMock,
        },
        {
          provide: UpdateEventUseCase,
          useValue: useCaseMock,
        },
        {
          provide: DeleteEventUseCase,
          useValue: useCaseMock,
        },
      ],
    }).compile();

    const controller = moduleRef.get(EventsController);
    const nonexistentId = 'does-not-exist';

    try {
      await expect(controller.getById(nonexistentId)).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(useCaseFindOneMock.execute).toHaveBeenCalledExactlyOnceWith(
        nonexistentId,
      );
    } finally {
      await moduleRef.close();
    }
  });

  it('Return event when id exists', async () => {
    const useCaseMock = {
      execute: vi.fn(),
    };

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

    const useCaseFindOneMock = {
      execute: vi.fn().mockResolvedValueOnce(event),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: GetAllEventsUseCase,
          useValue: useCaseMock,
        },
        {
          provide: GetOneByIdUseCase,
          useValue: useCaseFindOneMock,
        },
        {
          provide: CreateEventUseCase,
          useValue: useCaseMock,
        },
        {
          provide: UpdateEventUseCase,
          useValue: useCaseMock,
        },
        {
          provide: DeleteEventUseCase,
          useValue: useCaseMock,
        },
      ],
    }).compile();

    const controller = moduleRef.get(EventsController);
    const validId = 'existing-id';

    try {
      expect(await controller.getById(validId)).toBe(event);

      expect(useCaseFindOneMock.execute).toHaveBeenCalledExactlyOnceWith(
        validId,
      );
    } finally {
      await moduleRef.close();
    }
  });
});
