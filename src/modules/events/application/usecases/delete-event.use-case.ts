import type { EventRepository } from '../port/repository/events_repository.js';

export class DeleteEventUseCase {
  constructor(private readonly eventRepository: EventRepository) {}
  async execute(id: string): Promise<void> {
    await this.eventRepository.delete(id);
  }
}
