import { io } from 'socket.io-client';

// Заменяем localhost на твой рабочий адрес с SSL
export const socket = io('https://31-41-153-37.sslip.io', {
  withCredentials: true,
  autoConnect: false,
  // Добавляем websocket в приоритет, чтобы не висеть на polling
  transports: ['websocket', 'polling'] 
});

export const connectSocket = (userId: number) => {
  if (!socket.connected) {
    socket.connect();
    // Это событие сервер должен поймать и сопоставить socket.id с твоим userId
    socket.emit('join', userId); 
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};