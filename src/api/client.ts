import type { GreenApiCredentials } from '../types/chat';
import type {
  DeleteNotificationResponse,
  ReceiveNotificationResponse,
  SendMessagePayload,
  SendMessageResponse,
  StateInstanceResponse,
} from './types';

export class GreenApiClient {
  private credentials: GreenApiCredentials;

  constructor(credentials: GreenApiCredentials) {
    this.credentials = {
      ...credentials,
      host: credentials.host?.trim() || 'https://api.green-api.com',
    };
  }

  private buildUrl(method: string, extraPath = ''): string {
    const cleanHost = this.credentials.host.replace(/\/+$/, '');
    const cleanId = this.credentials.idInstance.trim();
    const cleanToken = this.credentials.apiTokenInstance.trim();
    const suffix = extraPath ? `/${extraPath}` : '';

    return `${cleanHost}/waInstance${cleanId}/${method}/${cleanToken}${suffix}`;
  }

  async getStateInstance(): Promise<StateInstanceResponse> {
    const url = this.buildUrl('getStateInstance');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Ошибка проверки инстанса (${response.status}): ${errText || response.statusText}`);
    }

    return response.json();
  }

  async sendMessage(chatId: string, message: string): Promise<SendMessageResponse> {
    const url = this.buildUrl('sendMessage');
    const payload: SendMessagePayload = {
      chatId,
      message,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Ошибка отправки сообщения (${response.status}): ${errText || response.statusText}`);
    }

    return response.json();
  }

  async receiveNotification(signal?: AbortSignal): Promise<ReceiveNotificationResponse | null> {
    const url = this.buildUrl('receiveNotification');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Ошибка получения уведомления (${response.status}): ${errText || response.statusText}`);
    }

    const text = await response.text();
    if (!text || text === 'null') {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  async deleteNotification(receiptId: number): Promise<DeleteNotificationResponse> {
    const url = this.buildUrl('deleteNotification', String(receiptId));

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Ошибка удаления уведомления (${response.status}): ${errText || response.statusText}`);
    }

    return response.json();
  }
}
