import {
  UseGuards,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Patch,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthorizationGuard } from '../../auth/authorization.guard.js';
import { AccessResource } from '../../auth/decorators/access-resource.decorator.js';
import type { Event } from '../application/models/event.js';
import { GetAllEventsUseCase } from '../application/usecases/get-all-events.use-case.js';
import { GetOneByIdUseCase } from '../application/usecases/get-one-by-id.use-case.js';
import { CreateEventUseCase } from '../application/usecases/create-event/create-event.use-case.js';
import { createEventRequestSchema } from '../application/usecases/create-event/create-event.schema.js';
import { DeleteEventUseCase } from '../application/usecases/delete-event.use-case.js';
import { UpdateEventUseCase } from '../application/usecases/update-event/update-event.use-case.js';
import { updateEventRequestSchema } from '../application/usecases/update-event/update-event.schema.js';
import { NotFoundError } from 'rxjs';
import { format } from 'node:util';
import type { CreateEventRequest } from '../application/usecases/create-event/create-event.use-case.js';

type CreateEventInput = Omit<CreateEventRequest, 'description' | 'isActive'> & {
  description?: string;
  isActive?: boolean;
};
type UpdateEventInput = Partial<CreateEventInput>;

@Controller('events')
@UseGuards(AuthorizationGuard)
@AccessResource('events')
export class EventsController {
  constructor(
    private readonly getAllEventsUseCase: GetAllEventsUseCase,
    private readonly getOneByIdUseCase: GetOneByIdUseCase,
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
  ) {}

  @Get()
  async getAll(): Promise<Event[]> {
    return this.getAllEventsUseCase.execute();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Event> {
    const event = await this.getOneByIdUseCase.execute(id);

    if (null === event) {
      throw new NotFoundException('Not found');
    }

    return event;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() input: CreateEventInput): Promise<Event> {
    const result = createEventRequestSchema.safeParse(input);

    if (!result.success) {
      throw new BadRequestException(result.error.issues);
    }
    try {
      return await this.createEventUseCase.execute(result.data);
    } catch (error) {
      // log context
      throw new InternalServerErrorException(
        'Something went wrong while creting event.',
      );
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('id') id: string,
    @Body() input: UpdateEventInput,
  ): Promise<void> {
    const result = updateEventRequestSchema.safeParse({
      id,
      body: input,
    });

    if (!result.success) {
      throw new BadRequestException(result.error.issues);
    }

    try {
      await this.updateEventUseCase.execute(result.data);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException('Not found');
      }

      throw new InternalServerErrorException(
        'Something went wrong during update of event.',
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    try {
      await this.deleteEventUseCase.execute(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      throw new InternalServerErrorException(
        format('Something went wrong during deletion %s', message),
      );
    }
  }
}
