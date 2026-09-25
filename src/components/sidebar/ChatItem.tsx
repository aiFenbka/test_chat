import React from 'react';
import { Check, CheckCheck, Trash2 } from 'lucide-react';
import type { Chat } from '../../types/chat';
import { formatChatDate } from '../../utils/date';
import { getInitials } from '../../utils/phone';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  isActive,
  onSelect,
  onDelete,
}) => {
  const initials = getInitials(chat.name || chat.phoneNumber);
  const lastMsg = chat.lastMessage;

  return (
    <div
      className={`chat-item ${isActive ? 'active' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
        }
      }}
    >
      <div
        className="chat-item-avatar"
        style={{ backgroundColor: chat.avatarColor || '#00a884' }}
      >
        <span>{initials}</span>
      </div>

      <div className="chat-item-content">
        <div className="chat-item-header">
          <span className="chat-item-title">{chat.name || chat.phoneNumber}</span>
          {lastMsg && (
            <span className="chat-item-time">{formatChatDate(lastMsg.timestamp)}</span>
          )}
        </div>

        <div className="chat-item-footer">
          <div className="chat-item-preview">
            {lastMsg ? (
              <>
                {lastMsg.direction === 'out' && (
                  <span className="msg-status-tick">
                    {lastMsg.status === 'pending' ? (
                      <Check size={14} className="tick-pending" />
                    ) : (
                      <CheckCheck size={14} className="tick-sent" />
                    )}
                  </span>
                )}
                <span className="preview-text">{lastMsg.text}</span>
              </>
            ) : (
              <span className="preview-empty">Чат создан</span>
            )}
          </div>

          <div className="chat-item-badges">
            {chat.unreadCount > 0 && (
              <span className="unread-counter">{chat.unreadCount}</span>
            )}
            <button
              type="button"
              className="chat-delete-btn"
              title="Удалить чат"
              onClick={onDelete}
              aria-label="Удалить чат"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
