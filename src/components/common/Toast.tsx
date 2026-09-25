import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useChat();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = Info;
        let iconClass = 'toast-icon-info';
        if (toast.type === 'success') {
          Icon = CheckCircle;
          iconClass = 'toast-icon-success';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          iconClass = 'toast-icon-error';
        }

        return (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            <Icon size={18} className={iconClass} />
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Закрыть"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
