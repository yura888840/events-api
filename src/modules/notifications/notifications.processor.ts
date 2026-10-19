import { Processor, WorkerHost } from '@nestjs/bullmq';
import { RequestContext } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/postgresql';
import { Job } from 'bullmq';
import { NotificationsService } from './notifications.service.js';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  constructor(
    private readonly orm: MikroORM,
    private readonly notificationsService: NotificationsService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'check-events':
        await RequestContext.create(this.orm.em, async () => {
          await this.notificationsService.checkEvents();
        });

        return;

      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  }
}
