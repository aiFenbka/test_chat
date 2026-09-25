import React from 'react';
import { MessageSquarePlus } from 'lucide-react';
import type { Chat } from '../../types/chat';
import { ChatItem } from './ChatItem';

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onOpenNewChat: () => void;
  searchQuery: string;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onOpenNewChat,
  searchQuery,
}) => {
  const filteredChats = chats.filter((chat) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      chat.name.toLowerCase().includes(query) ||
      chat.phoneNumber.toLowerCase().includes(query) ||
      chat.id.toLowerCase().includes(query)
    );
  });

  if (chats.length === 0) {
    return (
      <div className="sidebar-empty">
        <p className="sidebar-empty-title">Список чатов пуст</p>
        <p className="sidebar-empty-desc">
          Нажмите кнопку ниже, чтобы создать свой первый диалог по номеру телефона
        </p>
        <button
          type="button"
          className="create-first-chat-btn"
          onClick={onOpenNewChat}
        >
          <MessageSquarePlus size={16} />
          <span>Создать диалог</span>
        </button>
      </div>
    );
  }

  if (filteredChats.length === 0) {
    return (
      <div className="sidebar-empty">
        <p className="sidebar-empty-title">Ничего не найдено</p>
        <p className="sidebar-empty-desc">
          По запросу «{searchQuery}» нет совпадающих диалогов
        </p>
      </div>
    );
  }

  return (
    <div className="chat-list-scrollable">
      {filteredChats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onSelect={() => onSelectChat(chat.id)}
          onDelete={(e) => {
            e.stopPropagation();
            if (window.confirm(`Удалить диалог с ${chat.name || chat.phoneNumber}?`)) {
              onDeleteChat(chat.id);
            }
          }}
        />
      ))}
    </div>
  );
};
