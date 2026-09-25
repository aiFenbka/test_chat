import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { NewChatModal } from '../modals/NewChatModal';
import { ChatHeader } from './ChatHeader';
import { EmptyChat } from './EmptyChat';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';

export const ChatArea: React.FC = () => {
  const {
    activeChat,
    messages,
    sendMessage,
    clearChatMessages,
    deleteChat,
    simulateIncomingMessage,
  } = useChat();

  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  if (!activeChat) {
    return (
      <main className="chat-main-area">
        <EmptyChat onOpenNewChat={() => setIsNewChatModalOpen(true)} />
        <NewChatModal
          isOpen={isNewChatModalOpen}
          onClose={() => setIsNewChatModalOpen(false)}
        />
      </main>
    );
  }

  return (
    <main className="chat-main-area">
      <ChatHeader
        chat={activeChat}
        onClearHistory={() => clearChatMessages(activeChat.id)}
        onDeleteChat={() => deleteChat(activeChat.id)}
        onSimulateReply={() => simulateIncomingMessage()}
      />
      <MessageList messages={messages} />
      <MessageInput onSendMessage={sendMessage} />
    </main>
  );
};
