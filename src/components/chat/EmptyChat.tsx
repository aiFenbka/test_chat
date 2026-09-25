import { Lock, MessageSquare } from 'lucide-react';

interface EmptyChatProps {
  onOpenNewChat: () => void;
}

export const EmptyChat: React.FC<EmptyChatProps> = ({ onOpenNewChat }) => {
  return (
    <div className="empty-chat-pane">
      <div className="empty-chat-content">
        <div className="empty-chat-icon-container">
          <MessageSquare size={48} className="empty-chat-icon" />
        </div>
        <h2 className="empty-chat-title">MAX / WhatsApp Web</h2>
        <p className="empty-chat-desc">
          Отправляйте и получайте текстовые сообщения в реальном времени через сервис GREEN-API.
        </p>
        <p className="empty-chat-subdesc">
          Выберите диалог из списка слева или начните общение с новым контактом по номеру телефона.
        </p>

        <button
          type="button"
          className="empty-chat-action-btn"
          onClick={onOpenNewChat}
        >
          <span>Начать новый диалог</span>
        </button>

        <div className="empty-chat-footer">
          <Lock size={13} />
          <span>Прямое подключение к GREEN-API</span>
        </div>
      </div>
    </div>
  );
};
