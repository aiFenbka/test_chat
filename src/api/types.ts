export interface SendMessagePayload {
  chatId: string;
  message: string;
  quotedMessageId?: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface WebhookSenderData {
  chatId: string;
  sender: string;
  chatName?: string;
  senderName?: string;
  senderContactName?: string;
}

export interface WebhookMessageData {
  typeMessage: string;
  textMessageData?: {
    textMessage: string;
  };
  extendedTextMessageData?: {
    text: string;
    description?: string;
    title?: string;
  };
}

export interface WebhookBody {
  typeWebhook: string;
  instanceData?: {
    idInstance: number;
    wid: string;
    typeInstance: string;
  };
  timestamp?: number;
  idMessage?: string;
  senderData?: WebhookSenderData;
  messageData?: WebhookMessageData;
  stateInstance?: string;
}

export interface ReceiveNotificationResponse {
  receiptId: number;
  body: WebhookBody;
}

export interface DeleteNotificationResponse {
  result: boolean;
}

export interface StateInstanceResponse {
  stateInstance: 'authorized' | 'notAuthorized' | 'blocked' | 'sleepMode' | 'starting' | string;
}
