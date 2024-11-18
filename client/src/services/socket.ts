import { io } from 'socket.io-client';

export const socket = io('http://localhost:3000', {
  withCredentials: true,
  autoConnect: false
});

export const connectSocket = (userId: number) => {
  if (!socket.connected) {
    socket.connect();
    socket.emit('join', userId);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
}; 