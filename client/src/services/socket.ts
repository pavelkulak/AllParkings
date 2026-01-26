import { io } from 'socket.io-client';

const socket = io('https://31-41-153-37.sslip.io', {
  withCredentials: true,
  transports: ['websocket', 'polling']
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
