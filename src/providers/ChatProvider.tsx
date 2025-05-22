'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ChatContextType {
  sendMessage: (message: string) => Promise<void>;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { role: 'user', content: message }]);

      console.log('Sending message to API:', message);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      console.log('API response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      console.log('API response data:', data);
      
      if (!data.response) {
        throw new Error('Invalid response from server');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Системийн алдаа гарлаа. Дараа дахин оролдоно уу.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ sendMessage, messages, isLoading }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 