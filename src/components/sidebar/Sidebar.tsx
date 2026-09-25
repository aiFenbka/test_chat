import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { NewChatModal } from '../modals/NewChatModal';
import { ChatList } from './ChatList';
import { SearchInput } from './SearchInput';
import { SidebarHeader } from './SidebarHeader';

export const Sidebar: React.FC = () => {
  const { chats, activeChatId, selectChat, deleteChat } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <aside className="app-sidebar">
      <SidebarHeader onOpenNewChat={() => setIsModalOpen(true)} />
      <SearchInput value={searchQuery} onChange={setSearchQuery} />
      <ChatList
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onDeleteChat={deleteChat}
        onOpenNewChat={() => setIsModalOpen(true)}
        searchQuery={searchQuery}
      />
      <NewChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </aside>
  );
};
