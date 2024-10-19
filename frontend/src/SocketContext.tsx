import React, { createContext } from 'react';
import io, { Socket } from 'socket.io-client';

export const SocketContext = createContext<Socket | null>(null);

export const socket = io('http://localhost:5000');

interface SocketProviderProps {
  children: React.ReactNode;
}
export const SocketProvider: React.FC<SocketProviderProps>  = ({ children}) => (
  <SocketContext.Provider value={socket}>
    {children}
  </SocketContext.Provider>
);