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
  useTheme,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { getMessages } from '../../redux/chatThunks';
import { addMessage } from '../../redux/slices/chatSlice';

export const GeneralChat = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const { messages, status } = useAppSelector((state) => state.chat);
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

  const isOwnMessage = (msg: any) => msg.senderId === user?.id;

  return (
    <Paper 
      elevation={4}
      sx={{ 
        height: { xs: 'calc(100vh - 200px)', md: '75vh' },
        maxHeight: { xs: 'none', md: '700px' },
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        maxWidth: '900px',
        margin: 'auto',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      {/* Заголовок чата */}
      <Box 
        sx={{ 
          p: { xs: 1.5, md: 2 },
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <ChatIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
          Общий чат
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {messages.length} сообщений
        </Typography>
      </Box>

      {/* Область сообщений */}
      <Box 
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: { xs: 1.5, md: 2 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
          },
        }}
      >
        {status === 'loading' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: 'text.secondary',
            gap: 1,
          }}>
            <ChatIcon sx={{ fontSize: 48, opacity: 0.5 }} />
            <Typography variant="body1">Пока нет сообщений</Typography>
            <Typography variant="body2">Начните общение первым!</Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            const own = isOwnMessage(msg);
            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: own ? 'flex-end' : 'flex-start',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'flex-start',
                    flexDirection: own ? 'row-reverse' : 'row',
                    maxWidth: { xs: '85%', md: '70%' },
                  }}
                >
                  <Avatar 
                    src={
                      msg.sender?.avatar
                        ? `${import.meta.env.VITE_TARGET}${msg.sender.avatar}`
                        : undefined
                    }
                    sx={{
                      width: { xs: 36, md: 40 },
                      height: { xs: 36, md: 40 },
                      bgcolor: own ? 'primary.main' : 'secondary.main',
                      flexShrink: 0,
                    }}
                  >
                    {msg.sender?.name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: own ? 'flex-end' : 'flex-start',
                      minWidth: 0,
                    }}
                  >
                    <Stack 
                      direction="row" 
                      spacing={1} 
                      alignItems="baseline"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          color: own ? 'primary.main' : 'text.primary',
                        }}
                      >
                        {own ? 'Вы' : `${msg.sender?.name || 'Неизвестный'} ${msg.sender?.surname || ''}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(msg.createdAt), 'HH:mm', { locale: ru })}
                      </Typography>
                    </Stack>
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 1.5, md: 2 },
                        borderRadius: 2,
                        bgcolor: own 
                          ? (theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.main')
                          : (theme.palette.mode === 'dark' ? 'grey.800' : 'white'),
                        color: own ? 'white' : 'text.primary',
                        wordBreak: 'break-word',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        maxWidth: '100%',
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontSize: { xs: '0.875rem', md: '1rem' },
                          lineHeight: 1.5,
                        }}
                      >
                        {msg.content}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Поле ввода */}
      <Box 
        sx={{ 
          p: { xs: 1.5, md: 2 }, 
          borderTop: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Введите сообщение..."
            variant="outlined"
            size="small"
            disabled={!user}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
              }
            }}
            multiline
            maxRows={4}
          />
          <IconButton 
            onClick={handleSend} 
            color="primary"
            disabled={!message.trim() || !user}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.300',
                color: theme.palette.mode === 'dark' ? 'grey.600' : 'grey.500',
              },
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
        {!user && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Войдите, чтобы отправлять сообщения
          </Typography>
        )}
      </Box>
    </Paper>
  );
};