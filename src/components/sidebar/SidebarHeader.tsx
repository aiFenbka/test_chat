import { MessageSquarePlus, LogOut, Play, Pause, Sparkles } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

interface SidebarHeaderProps {
  onOpenNewChat: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onOpenNewChat }) => {
  const {
    credentials,
    connectionStatus,
    isPolling,
    setIsPolling,
    logout,
    simulateIncomingMessage,
  } = useChat();

  let statusText = 'В сети';
  let statusDotClass = 'status-dot-active';

  if (!isPolling) {
    statusText = 'Пауза';
    statusDotClass = 'status-dot-paused';
  } else if (connectionStatus === 'error') {
    statusText = 'Сбой сети';
    statusDotClass = 'status-dot-error';
  } else if (connectionStatus === 'polling') {
    statusText = 'Опрос уведомлений';
    statusDotClass = 'status-dot-polling';
  }

  return (
    <div className="sidebar-header">
      <div className="user-profile-info">
        <div className="user-avatar-badge">
          <span>WA</span>
        </div>
        <div className="user-details">
          <div className="instance-id-title">ID: {credentials?.idInstance || '—'}</div>
          <div className="status-indicator">
            <span className={`status-dot ${statusDotClass}`} />
            <span className="status-label">{statusText}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-header-actions">
        <button
          type="button"
          className="header-action-btn"
          title="Симулировать входящий ответ"
          onClick={() => simulateIncomingMessage()}
        >
          <Sparkles size={18} />
        </button>

        <button
          type="button"
          className="header-action-btn"
          title={isPolling ? 'Приостановить опрос' : 'Возобновить опрос'}
          onClick={() => setIsPolling(!isPolling)}
        >
          {isPolling ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <button
          type="button"
          className="header-action-btn primary"
          title="Новый чат"
          onClick={onOpenNewChat}
        >
          <MessageSquarePlus size={20} />
        </button>

        <button
          type="button"
          className="header-action-btn"
          title="Завершить сессию"
          onClick={logout}
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};
