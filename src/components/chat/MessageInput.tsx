import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<void>;
  disabled?: boolean;
}

const COMMON_EMOJIS = ['👋', '👍', '😊', '🔥', '❤️', '😂', '🎉', '🙏', '🤝', '🚀', '👌', '⭐'];

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSendMessage(trimmed);
      setText('');
      setShowEmojiPicker(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  return (
    <footer className="message-input-bar">
      {showEmojiPicker && (
        <div className="emoji-quick-bar">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="emoji-btn"
              onClick={() => addEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="input-toolbar-left">
        <button
          type="button"
          className={`input-action-btn ${showEmojiPicker ? 'active' : ''}`}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          title="Смайлики"
          aria-label="Смайлики"
        >
          <Smile size={22} />
        </button>

        <button
          type="button"
          className="input-action-btn disabled-feature"
          title="Отправка вложений отключена (только текст согласно ТЗ)"
          aria-label="Прикрепить файл"
          disabled
        >
          <Paperclip size={20} />
        </button>
      </div>

      <div className="input-field-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          rows={1}
          placeholder="Введите сообщение..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
        />
      </div>

      <div className="input-toolbar-right">
        <button
          type="button"
          className={`send-msg-btn ${text.trim() ? 'send-msg-btn-active' : ''}`}
          onClick={handleSend}
          disabled={!text.trim() || isSending || disabled}
          title="Отправить сообщение"
          aria-label="Отправить сообщение"
        >
          <Send size={18} />
        </button>
      </div>
    </footer>
  );
};
