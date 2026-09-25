import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import type { Message } from '../../types/chat';
import { formatMessageTime } from '../../utils/date';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isOut = message.direction === 'out';

  return (
    <div className={`message-row ${isOut ? 'row-outgoing' : 'row-incoming'}`}>
      <div className={`message-bubble ${isOut ? 'bubble-outgoing' : 'bubble-incoming'}`}>
        <div className="message-text">{message.text}</div>
        <div className="message-meta">
          <span className="message-timestamp">
            {formatMessageTime(message.timestamp)}
          </span>
          {isOut && (
            <span className="message-tick">
              {message.status === 'pending' ? (
                <Clock size={12} className="tick-pending" />
              ) : message.status === 'sent' ? (
                <Check size={14} className="tick-sent" />
              ) : (
                <CheckCheck size={14} className="tick-delivered" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
