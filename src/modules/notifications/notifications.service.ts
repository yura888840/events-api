import { Injectable } from '@nestjs/common';
import { MikroOrmEventRepository } from '../events/application/infrastructure/persistence/event.repository.js';
import { EventReminderRepository } from './repository/event-reminder.repository.js';
import { TelegramService } from './telegram.service.js';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly eventRepository: MikroOrmEventRepository,
    private readonly reminderRepository: EventReminderRepository,
    private readonly telegramService: TelegramService,
  ) {}

  async checkEvents(): Promise<void> {
    const events = await this.eventRepository.getAll();
    const today = new Date();

    for (const daysBefore of [2, 3]) {
      const targetDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + daysBefore,
      );

      const occurrenceDate = this.formatDate(targetDate);

      const matchingEvents = events.filter((event) => {
        if (!event.isActive) {
          return false;
        }

        const matchesDay =
          event.month === targetDate.getMonth() + 1 &&
          event.day === targetDate.getDate();

        const matchesYear =
          event.recurrence === 'yearly' ||
          event.year === targetDate.getFullYear();

        return matchesDay && matchesYear;
      });

      for (const event of matchingEvents) {
        const alreadySent = await this.reminderRepository.hasBeenSent(
          event.id,
          occurrenceDate,
          daysBefore,
        );

        if (alreadySent) {
          continue;
        }

        const message = [
          `Напоминание: ${event.name}`,
          `Через ${daysBefore} дня — ${occurrenceDate}`,
          event.description,
        ]
          .filter(Boolean)
          .join('\n');

        await this.telegramService.sendMessage(message);

        await this.reminderRepository.markAsSent(
          event.id,
          occurrenceDate,
          daysBefore,
        );
      }
    }
  }
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
