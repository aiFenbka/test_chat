export interface GreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
  host: string;
}

export type MessageDirection = 'in' | 'out';
export type MessageStatus = 'pending' | 'sent' | 'delivered';

export interface Message {
  id: string;
  chatId: string;
  text: string;
  timestamp: number;
  direction: MessageDirection;
  status: MessageStatus;
}

export interface Chat {
  id: string;
  phoneNumber: string;
  name: string;
  avatarColor: string;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'polling' | 'error';
