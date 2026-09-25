import { Eraser, Sparkles, Trash2 } from 'lucide-react';
import type { Chat } from '../../types/chat';
import { getInitials } from '../../utils/phone';

interface ChatHeaderProps {
  chat: Chat;
  onClearHistory: () => void;
  onDeleteChat: () => void;
  onSimulateReply: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  onClearHistory,
  onDeleteChat,
  onSimulateReply,
}) => {
  const initials = getInitials(chat.name || chat.phoneNumber);

  return (
    <header className="chat-header">
      <div className="chat-header-user">
        <div
          className="chat-header-avatar"
          style={{ backgroundColor: chat.avatarColor || '#00a884' }}
        >
          <span>{initials}</span>
        </div>
        <div className="chat-header-info">
          <h3 className="chat-header-name">{chat.name || chat.phoneNumber}</h3>
          <span className="chat-header-phone">{chat.phoneNumber}</span>
        </div>
      </div>

      <div className="chat-header-actions">
        <button
          type="button"
          className="header-action-btn"
          title="Симулировать ответ собеседника"
          onClick={onSimulateReply}
        >
          <Sparkles size={18} />
        </button>

        <button
          type="button"
          className="header-action-btn"
          title="Очистить историю сообщений"
          onClick={() => {
            if (window.confirm('Очистить историю сообщений в этом чате?')) {
              onClearHistory();
            }
          }}
        >
          <Eraser size={18} />
        </button>

        <button
          type="button"
          className="header-action-btn danger"
          title="Удалить чат"
          onClick={() => {
            if (window.confirm(`Удалить диалог с ${chat.name || chat.phoneNumber}?`)) {
              onDeleteChat();
            }
          }}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </header>
  );
};
