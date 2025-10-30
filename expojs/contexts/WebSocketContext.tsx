import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { webSocketService } from '@/services/websocket';
import { WebSocketMessage, AnonymousMessage } from '@/types/api';

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendAnonymousMessage: (content: string, replyToId?: string) => void;
  subscribeToMessages: (handler: (message: WebSocketMessage) => void) => void;
  unsubscribeFromMessages: (handler: (message: WebSocketMessage) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');

  useEffect(() => {
    const updateConnectionState = () => {
      const state = webSocketService.getConnectionState();
      setConnectionState(state);
      setIsConnected(state === 'connected');
    };

    // Check connection state periodically
    const interval = setInterval(updateConnectionState, 1000);

    // Initial state check
    updateConnectionState();

    return () => clearInterval(interval);
  }, []);

  const connect = async () => {
    try {
      await webSocketService.connectToAnonymousChat();
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      throw error;
    }
  };

  const disconnect = () => {
    webSocketService.disconnect();
  };

  const sendAnonymousMessage = (content: string, replyToId?: string) => {
    webSocketService.sendAnonymousMessage(content, replyToId);
  };

  const subscribeToMessages = (handler: (message: WebSocketMessage) => void) => {
    webSocketService.subscribe(handler);
  };

  const unsubscribeFromMessages = (handler: (message: WebSocketMessage) => void) => {
    webSocketService.unsubscribe(handler);
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        connectionState,
        connect,
        disconnect,
        sendAnonymousMessage,
        subscribeToMessages,
        unsubscribeFromMessages,
      }}
    >
      { children }
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
