
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SocketContextType {
  isConnected: boolean;
  sendMessage: (message: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  // Placeholder for actual socket implementation
  const sendMessage = (message: any) => {
    console.log('Socket message sent (placeholder):', message);
  };

  // Simulate connection
  useEffect(() => {
    setIsConnected(true);
    return () => {
      setIsConnected(false);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ isConnected, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
