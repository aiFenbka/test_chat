import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GreenApiClient } from './client';
import type { GreenApiCredentials } from '../types/chat';
import type {
  DeleteNotificationResponse,
  SendMessageResponse,
  StateInstanceResponse,
} from './types';

export const greenApiKeys = {
  all: ['greenApi'] as const,
  instanceState: (idInstance?: string) => [...greenApiKeys.all, 'state', idInstance] as const,
  notifications: (idInstance?: string) => [...greenApiKeys.all, 'notifications', idInstance] as const,
};

export function useCheckInstanceStateMutation() {
  const queryClient = useQueryClient();

  return useMutation<StateInstanceResponse, Error, GreenApiCredentials>({
    mutationFn: async (credentials: GreenApiCredentials) => {
      const client = new GreenApiClient(credentials);
      return client.getStateInstance();
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(greenApiKeys.instanceState(variables.idInstance), data);
    },
  });
}

export interface SendMessageParams {
  chatId: string;
  message: string;
}

export function useSendMessageMutation(client: GreenApiClient | null) {
  return useMutation<SendMessageResponse, Error, SendMessageParams>({
    mutationFn: async ({ chatId, message }) => {
      if (!client) {
        throw new Error('Клиент GREEN-API не инициализирован');
      }
      return client.sendMessage(chatId, message);
    },
  });
}

export function useDeleteNotificationMutation(client: GreenApiClient | null) {
  return useMutation<DeleteNotificationResponse, Error, number>({
    mutationFn: async (receiptId: number) => {
      if (!client) {
        throw new Error('Клиент GREEN-API не инициализирован');
      }
      return client.deleteNotification(receiptId);
    },
  });
}
