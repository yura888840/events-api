import { Test } from '@nestjs/testing';
import { describe, it, expect, vi } from 'vitest';
import { EventsController } from './events.controller.js';
import { GetAllEventsUseCase } from '../application/usecases/get-all-events.use-case.js';
import type { Event } from '../application/models/event.js';
import { GetOneByIdUseCase } from '../application/usecases/get-one-by-id.use-case.js';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventUseCase } from '../application/usecases/create-event/create-event.use-case.js';
import { UpdateEventUseCase } from '../application/usecases/update-event/update-event.use-case.js';
import { DeleteEventUseCase } from '../application/usecases/delete-event.use-case.js';
import { NotFoundError } from 'rxjs';

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

async function createController({
  getAll = vi.fn(),
  getById = vi.fn(),
  create = vi.fn(),
  update = vi.fn(),
  remove = vi.fn(),
} = {}) {
  const moduleRef = await Test.createTestingModule({
    controllers: [EventsController],
    providers: [
      { provide: GetAllEventsUseCase, useValue: { execute: getAll } },
      { provide: GetOneByIdUseCase, useValue: { execute: getById } },
      { provide: CreateEventUseCase, useValue: { execute: create } },
      { provide: UpdateEventUseCase, useValue: { execute: update } },
      { provide: DeleteEventUseCase, useValue: { execute: remove } },
    ],
  }).compile();

  return {
    controller: moduleRef.get(EventsController),
    close: () => moduleRef.close(),
  };
}

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

  it('creates a validated event with schema defaults', async () => {
    const create = vi.fn().mockResolvedValue(event);
    const { controller, close } = await createController({ create });

    try {
      await expect(
        controller.create({
          name: ' Birthday ',
          month: 7,
          day: 4,
          type: 'birthday',
          recurrence: 'yearly',
        }),
      ).resolves.toEqual(event);

      expect(create).toHaveBeenCalledExactlyOnceWith({
        name: 'Birthday',
        description: '',
        month: 7,
        day: 4,
        type: 'birthday',
        recurrence: 'yearly',
        isActive: true,
      });
    } finally {
      await close();
    }
  });

  it('rejects invalid create input without calling the use case', async () => {
    const create = vi.fn();
    const { controller, close } = await createController({ create });

    try {
      await expect(
        controller.create({ ...event, name: '' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(create).not.toHaveBeenCalled();
    } finally {
      await close();
    }
  });

  it('maps create use-case failures to InternalServerErrorException', async () => {
    const create = vi.fn().mockRejectedValue(new Error('database unavailable'));
    const { controller, close } = await createController({ create });

    try {
      await expect(controller.create(event)).rejects.toMatchObject({
        response: {
          message: 'Something went wrong while creting event.',
        },
      });
    } finally {
      await close();
    }
  });

  it('updates a valid event and passes normalized request to the use case', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const { controller, close } = await createController({ update });
    const id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    try {
      await expect(
        controller.update(id, { name: ' Anniversary ' }),
      ).resolves.toBeUndefined();
      expect(update).toHaveBeenCalledExactlyOnceWith({
        id,
        changes: { name: 'Anniversary' },
      });
    } finally {
      await close();
    }
  });

  it('rejects invalid update input without calling the use case', async () => {
    const update = vi.fn();
    const { controller, close } = await createController({ update });

    try {
      await expect(controller.update('not-a-uuid', {})).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(update).not.toHaveBeenCalled();
    } finally {
      await close();
    }
  });

  it('maps missing events during update to NotFoundException', async () => {
    const update = vi.fn().mockRejectedValue(new NotFoundError('missing'));
    const { controller, close } = await createController({ update });

    try {
      await expect(
        controller.update('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', {
          name: 'Anniversary',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    } finally {
      await close();
    }
  });

  it('maps unexpected update failures to InternalServerErrorException', async () => {
    const update = vi.fn().mockRejectedValue(new Error('database unavailable'));
    const { controller, close } = await createController({ update });

    try {
      await expect(
        controller.update('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', {
          name: 'Anniversary',
        }),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    } finally {
      await close();
    }
  });

  it('deletes an event by id', async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    const { controller, close } = await createController({ remove });

    try {
      await expect(controller.delete('event-1')).resolves.toBeUndefined();
      expect(remove).toHaveBeenCalledExactlyOnceWith('event-1');
    } finally {
      await close();
    }
  });

  it('includes delete failures in the internal-server error response', async () => {
    const remove = vi.fn().mockRejectedValue(new Error('database unavailable'));
    const { controller, close } = await createController({ remove });

    try {
      await expect(controller.delete('event-1')).rejects.toMatchObject({
        response: {
          message: 'Something went wrong during deletion database unavailable',
        },
      });
    } finally {
      await close();
    }
  });

  it('stringifies non-Error delete failures in the internal-server error response', async () => {
    const remove = vi.fn().mockRejectedValue('boom');
    const { controller, close } = await createController({ remove });

    try {
      await expect(controller.delete('event-1')).rejects.toMatchObject({
        response: {
          message: 'Something went wrong during deletion boom',
        },
      });
    } finally {
      await close();
    }
  });
});
