import { Injectable } from '@nestjs/common';

type TelegramResponse = {
  ok: boolean;
  description?: string;
};

@Injectable()
export class TelegramService {
  private readonly botToken = '<secret>';
  private readonly chatId = 'chat_id';

  async sendMessage(text: string): Promise<void> {
    const response = await fetch(
      `https://api.telegram.org/bot${this.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );

    const result = (await response.json()) as TelegramResponse;

    if (!response.ok || !result.ok) {
      throw new Error(
        `Telegram send failed: ${
          result.description ?? `HTTP ${response.status}`
        }`,
      );
    }
  }
}
