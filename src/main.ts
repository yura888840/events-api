import { NestFactory } from '@nestjs/core';
import {
  EventsModule,
  ObserveInstrument,
} from './modules/events/events.module.js';

async function bootstrap() {
  const app = await NestFactory.create(EventsModule, {
    instrument: ObserveInstrument,
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
