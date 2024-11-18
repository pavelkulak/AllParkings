// src/components/chat/GeneralChat.tsx
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { socket } from '../../services/socket';
import { 
  Box, 
  Paper,
  Stack, 
  TextField, 
  IconButton, 
  Typography,
  Avatar,
  
  
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getMessages } from '../../redux/chatThunks';
import { addMessage } from '../../redux/slices/chatSlice';

export const GeneralChat = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { messages } = useAppSelector((state) => state.chat);
  const [message, setMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(getMessages());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      socket.connect();
      
      socket.on('new_message', (message) => {
        dispatch(addMessage(message));
      });

      return () => {
        socket.disconnect();
        socket.off('new_message');
      };
    }
  }, [user, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !user) return;

    socket.emit('general_message', {
      senderId: user.id,
      content: message
    });

    setMessage('');
  };

  return (
    <>
      <Paper sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start'
              }}
            >
              <Avatar 
                src={
                  msg.sender?.avatar
                    ? `${import.meta.env.VITE_TARGET}${msg.sender.avatar}`
                    : undefined
                }
              />
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="baseline">
                  <Typography variant="subtitle2" color="primary">
                    {msg.sender?.name} {msg.sender?.surname}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(msg.createdAt), 'HH:mm dd MMM', { locale: ru })}
                  </Typography>
                </Stack>
                <Typography>{msg.content}</Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Введите сообщение..."
              size="small"
            />
            <IconButton onClick={handleSend} color="primary">
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Paper>
    </>
  );
};