import React, { useEffect, useRef } from 'react';
import type { Message } from '../../types/chat';
import { formatSeparatorDate, isSameDay } from '../../utils/date';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="message-list-empty">
        <div className="empty-dialog-badge">
          Сообщений пока нет. Напишите первое сообщение, чтобы начать диалог.
        </div>
      </div>
    );
  }

  return (
    <div className="message-list-container">
      {messages.map((msg, index) => {
        const prevMsg = messages[index - 1];
        const showDateSeparator = !prevMsg || !isSameDay(prevMsg.timestamp, msg.timestamp);

        return (
          <React.Fragment key={msg.id}>
            {showDateSeparator && (
              <div className="date-separator-row">
                <span className="date-separator-pill">
                  {formatSeparatorDate(msg.timestamp)}
                </span>
              </div>
            )}
            <MessageBubble message={msg} />
          </React.Fragment>
        );
      })}
      <div ref={bottomRef} className="scroll-anchor" />
    </div>
  );
};
