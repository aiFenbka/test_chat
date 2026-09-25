import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import { AuthScreen } from './components/auth/AuthScreen';
import { ChatArea } from './components/chat/ChatArea';
import { ToastContainer } from './components/common/Toast';
import { Sidebar } from './components/sidebar/Sidebar';
import { ChatProvider, useChat } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';

const MainLayout: React.FC = () => {
  const { credentials } = useChat();

  if (!credentials) {
    return (
      <div className="app-shell">
        <AuthScreen />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="messenger-window">
        <Sidebar />
        <ChatArea />
      </div>
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ChatProvider>
          <MainLayout />
        </ChatProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
