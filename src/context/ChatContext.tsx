import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GreenApiClient } from '../api/client';
import { useDeleteNotificationMutation, useSendMessageMutation } from '../api/hooks';
import type { Chat, ConnectionStatus, GreenApiCredentials, Message } from '../types/chat';
import { formatDisplayPhone, getAvatarColor, toChatId } from '../utils/phone';
import { sound } from '../utils/sound';

interface ToastInfo {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

interface ChatContextValue {
  credentials: GreenApiCredentials | null;
  setCredentials: (creds: GreenApiCredentials | null) => void;
  chats: Chat[];
  activeChat: Chat | null;
  activeChatId: string | null;
  messages: Message[];
  connectionStatus: ConnectionStatus;
  isPolling: boolean;
  setIsPolling: (polling: boolean) => void;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  removeToast: (id: string) => void;
  createChat: (phoneInput: string, name?: string) => string;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  clearChatMessages: (chatId: string) => void;
  sendMessage: (text: string) => Promise<void>;
  simulateIncomingMessage: (text?: string) => void;
  logout: () => void;
}

const STORAGE_KEYS = {
  CREDENTIALS: 'green_api_creds',
  CHATS: 'green_api_chats',
  MESSAGES: 'green_api_messages',
  ACTIVE_CHAT: 'green_api_active_chat',
};

const ChatContext = createContext<ChatContextValue | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [credentials, setCredentialsState] = useState<GreenApiCredentials | null>(() =>
    loadFromStorage<GreenApiCredentials | null>(STORAGE_KEYS.CREDENTIALS, null)
  );
  const [chats, setChats] = useState<Chat[]>(() =>
    loadFromStorage<Chat[]>(STORAGE_KEYS.CHATS, [])
  );
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() =>
    loadFromStorage<Record<string, Message[]>>(STORAGE_KEYS.MESSAGES, {})
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(() =>
    loadFromStorage<string | null>(STORAGE_KEYS.ACTIVE_CHAT, null)
  );

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const client = useMemo(() => {
    return credentials ? new GreenApiClient(credentials) : null;
  }, [credentials]);

  const sendMessageMutation = useSendMessageMutation(client);
  const deleteNotificationMutation = useDeleteNotificationMutation(client);

  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingActiveRef = useRef<boolean>(false);

  useEffect(() => {
    try {
      if (credentials) {
        localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
      }
    } catch {
      // Storage quota exceeded or disabled
    }
  }, [credentials]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    } catch {}
  }, [chats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messagesMap));
    } catch {}
  }, [messagesMap]);

  useEffect(() => {
    try {
      if (activeChatId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT, JSON.stringify(activeChatId));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHAT);
      }
    } catch {}
  }, [activeChatId]);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setCredentials = useCallback((creds: GreenApiCredentials | null) => {
    setCredentialsState(creds);
    if (!creds) {
      setConnectionStatus('disconnected');
    }
  }, []);

  const createChat = useCallback((phoneInput: string, name?: string): string => {
    const chatId = toChatId(phoneInput);
    const displayName = name?.trim() || formatDisplayPhone(chatId);

    setChats((prev) => {
      const existing = prev.find((c) => c.id === chatId);
      if (existing) {
        return prev;
      }
      const newChat: Chat = {
        id: chatId,
        phoneNumber: formatDisplayPhone(chatId),
        name: displayName,
        avatarColor: getAvatarColor(chatId),
        unreadCount: 0,
        updatedAt: Date.now(),
      };
      return [newChat, ...prev];
    });

    setActiveChatId(chatId);
    return chatId;
  }, []);

  const selectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat))
    );
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    setMessagesMap((prev) => {
      const copy = { ...prev };
      delete copy[chatId];
      return copy;
    });
    setActiveChatId((current) => (current === chatId ? null : current));
  }, []);

  const clearChatMessages = useCallback((chatId: string) => {
    setMessagesMap((prev) => ({
      ...prev,
      [chatId]: [],
    }));
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, lastMessage: undefined } : c))
    );
  }, []);

  const logout = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    pollingActiveRef.current = false;
    setCredentialsState(null);
    setConnectionStatus('disconnected');
    showToast('Сессия завершена', 'info');
  }, [showToast]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!credentials) {
        showToast('Отсутствуют учетные данные GREEN-API', 'error');
        return;
      }
      if (!activeChatId) {
        showToast('Чат не выбран', 'error');
        return;
      }

      const trimmed = text.trim();
      if (!trimmed) return;

      const tempId = `out_${Date.now()}_${Math.random()}`;
      const outgoingMessage: Message = {
        id: tempId,
        chatId: activeChatId,
        text: trimmed,
        timestamp: Date.now(),
        direction: 'out',
        status: 'pending',
      };

      setMessagesMap((prev) => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), outgoingMessage],
      }));

      setChats((prev) => {
        const found = prev.find((c) => c.id === activeChatId);
        const updatedChat: Chat = found
          ? { ...found, lastMessage: outgoingMessage, updatedAt: Date.now() }
          : {
              id: activeChatId,
              phoneNumber: formatDisplayPhone(activeChatId),
              name: formatDisplayPhone(activeChatId),
              avatarColor: getAvatarColor(activeChatId),
              unreadCount: 0,
              lastMessage: outgoingMessage,
              updatedAt: Date.now(),
            };

        return [updatedChat, ...prev.filter((c) => c.id !== activeChatId)];
      });

      sound.playSent();

      try {
        const res = await sendMessageMutation.mutateAsync({
          chatId: activeChatId,
          message: trimmed,
        });

        setMessagesMap((prev) => {
          const list = prev[activeChatId] || [];
          return {
            ...prev,
            [activeChatId]: list.map((msg) =>
              msg.id === tempId ? { ...msg, id: res.idMessage || msg.id, status: 'sent' } : msg
            ),
          };
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Не удалось отправить сообщение';
        showToast(errorMessage, 'error');
        setMessagesMap((prev) => {
          const list = prev[activeChatId] || [];
          return {
            ...prev,
            [activeChatId]: list.map((msg) =>
              msg.id === tempId ? { ...msg, status: 'pending' } : msg
            ),
          };
        });
      }
    },
    [credentials, activeChatId, showToast]
  );

  const simulateIncomingMessage = useCallback(
    (text = 'Привет! Тестовый ответ от собеседника') => {
      const targetChatId = activeChatId || chats[0]?.id;
      if (!targetChatId) {
        showToast('Создайте или откройте чат для симуляции', 'info');
        return;
      }

      const incomingMsg: Message = {
        id: `sim_${Date.now()}`,
        chatId: targetChatId,
        text,
        timestamp: Date.now(),
        direction: 'in',
        status: 'delivered',
      };

      setMessagesMap((prev) => ({
        ...prev,
        [targetChatId]: [...(prev[targetChatId] || []), incomingMsg],
      }));

      setChats((prev) =>
        prev.map((c) => {
          if (c.id === targetChatId) {
            return {
              ...c,
              lastMessage: incomingMsg,
              updatedAt: Date.now(),
              unreadCount: targetChatId === activeChatId ? 0 : c.unreadCount + 1,
            };
          }
          return c;
        })
      );

      sound.playIncoming();
      showToast('Получено симулированное входящее сообщение', 'success');
    },
    [activeChatId, chats, showToast]
  );

  useEffect(() => {
    if (!credentials || !isPolling) {
      setConnectionStatus(credentials ? 'connected' : 'disconnected');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      pollingActiveRef.current = false;
      return;
    }

    let isMounted = true;
    pollingActiveRef.current = true;
    const client = new GreenApiClient(credentials);

    const runPolling = async () => {
      setConnectionStatus('polling');

      while (isMounted && pollingActiveRef.current && isPolling) {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
          const notification = await client.receiveNotification(controller.signal);

          if (!isMounted || !pollingActiveRef.current) break;

          if (notification && notification.receiptId) {
            const { receiptId, body } = notification;

            if (body && body.typeWebhook === 'incomingMessageReceived') {
              const text =
                body.messageData?.textMessageData?.textMessage ||
                body.messageData?.extendedTextMessageData?.text ||
                '';

              const senderChatId = body.senderData?.chatId || body.senderData?.sender;

              if (text && senderChatId) {
                const messageId = body.idMessage || `in_${receiptId}_${Date.now()}`;
                const msgTime = body.timestamp ? body.timestamp * 1000 : Date.now();

                const newMsg: Message = {
                  id: messageId,
                  chatId: senderChatId,
                  text,
                  timestamp: msgTime,
                  direction: 'in',
                  status: 'delivered',
                };

                setMessagesMap((prev) => {
                  const currentList = prev[senderChatId] || [];
                  if (currentList.some((m) => m.id === messageId)) {
                    return prev;
                  }
                  return {
                    ...prev,
                    [senderChatId]: [...currentList, newMsg],
                  };
                });

                setChats((prev) => {
                  const existingIndex = prev.findIndex((c) => c.id === senderChatId);
                  const isCurrentActive = senderChatId === activeChatId;

                  if (existingIndex >= 0) {
                    const existing = prev[existingIndex];
                    const updated: Chat = {
                      ...existing,
                      lastMessage: newMsg,
                      updatedAt: msgTime,
                      unreadCount: isCurrentActive ? 0 : existing.unreadCount + 1,
                    };
                    const next = [...prev];
                    next.splice(existingIndex, 1);
                    return [updated, ...next];
                  }

                  const displayName =
                    body.senderData?.senderName ||
                    body.senderData?.chatName ||
                    formatDisplayPhone(senderChatId);

                  const brandNew: Chat = {
                    id: senderChatId,
                    phoneNumber: formatDisplayPhone(senderChatId),
                    name: displayName,
                    avatarColor: getAvatarColor(senderChatId),
                    unreadCount: isCurrentActive ? 0 : 1,
                    lastMessage: newMsg,
                    updatedAt: msgTime,
                  };
                  return [brandNew, ...prev];
                });

                sound.playIncoming();
              }
            }

            try {
              await deleteNotificationMutation.mutateAsync(receiptId);
            } catch {
              // Failed to delete notification, will retry next cycle
            }
          } else {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }

          setConnectionStatus('polling');
        } catch (err: unknown) {
          if (err instanceof Error && err.name === 'AbortError') {
            break;
          }
          setConnectionStatus('error');
          await new Promise((resolve) => setTimeout(resolve, 3500));
        }
      }
    };

    runPolling();

    return () => {
      isMounted = false;
      pollingActiveRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [credentials, isPolling, activeChatId]);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const currentMessages = activeChatId ? messagesMap[activeChatId] || [] : [];

  const value: ChatContextValue = {
    credentials,
    setCredentials,
    chats,
    activeChat,
    activeChatId,
    messages: currentMessages,
    connectionStatus,
    isPolling,
    setIsPolling,
    toasts,
    showToast,
    removeToast,
    createChat,
    selectChat,
    deleteChat,
    clearChatMessages,
    sendMessage,
    simulateIncomingMessage,
    logout,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextValue => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
