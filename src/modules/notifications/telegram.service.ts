import { Injectable } from '@nestjs/common';

type TelegramResponse = {
  ok: boolean;
  description?: string;
};

@Injectable()
export class TelegramService {
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN;
  private readonly chatId = process.env.TELEGRAM_CHAT_ID;

  async sendMessage(text: string): Promise<void> {
    if (this.botToken === undefined || this.chatId === undefined) {
      throw new Error(
        'Telegram configuration is missing: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set',
      );
    }

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
