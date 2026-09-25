import React, { useState, useEffect } from 'react';
import { MessageSquarePlus, Phone, User, X, ArrowRight } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { cleanDigits, formatDisplayPhone, toChatId } from '../../utils/phone';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
  const { createChat, showToast } = useChat();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPhone('');
      setName('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rawDigits = cleanDigits(phone);
  const normalizedChatId = rawDigits ? toChatId(phone) : '';
  const displayPreview = normalizedChatId ? formatDisplayPhone(normalizedChatId) : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rawDigits || rawDigits.length < 7) {
      showToast('Введите корректный номер телефона (не менее 7 цифр)', 'error');
      return;
    }

    const chatId = createChat(phone, name);
    showToast(`Чат с ${name || formatDisplayPhone(chatId)} открыт`, 'success');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <MessageSquarePlus size={20} className="modal-header-icon" />
            <h3>Новый чат</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="newPhone" className="form-label">
              <Phone size={15} />
              <span>Номер телефона получателя</span>
            </label>
            <input
              id="newPhone"
              type="tel"
              className="form-input"
              placeholder="+7 (999) 123-45-67 или 79991234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoFocus
            />
            {displayPreview && (
              <div className="phone-preview-badge">
                <span>WhatsApp ID:</span>
                <strong>{normalizedChatId}</strong>
                <span>({displayPreview})</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="newName" className="form-label">
              <User size={15} />
              <span>Имя контакта (необязательно)</span>
            </label>
            <input
              id="newName"
              type="text"
              className="form-input"
              placeholder="Например: Иван Иванов"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn-primary" disabled={!rawDigits}>
              <span>Создать чат</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
