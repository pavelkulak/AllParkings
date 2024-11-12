import { useAppSelector } from '../../redux/hooks';
import {
  Box,
  Typography,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useState, useRef } from 'react';
import axiosInstance from '../../services/axiosInstance';
import { useDispatch } from 'react-redux';
import { updateUserAvatar } from '../../redux/slices/authSlice';

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const fullName = `
  ${user?.surname || ''} 
  ${user?.name || ''} 
  ${user?.patronymic || ''}`
  .trim();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axiosInstance.post('/api/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      dispatch(updateUserAvatar(response.data.avatar));
    } catch (error: any) {
      console.error('Ошибка при загрузке аватара:', error);
      alert(error.response?.data?.error || 'Ошибка при загрузке аватара');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
      }}
    >
      <Box sx={{ display: 'flex', width: '90%', flexDirection: 'column' }}>
        <Box
          sx={{
            border: '1px solid #ddd',
            borderRadius: 3,
            p: 3,
            mb: 2,
            display: 'flex',
            gap: 8,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: '1px solid #ddd',
              px: 5,
              minHeight: '100%',
            }}
          >
            <Avatar
              src={user?.avatar ? `${import.meta.env.VITE_API_URL}${user.avatar}` : undefined}
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'lightblue',
                fontSize: '3.5rem'
              }}
            >
              {!user?.avatar && (user?.name.charAt(0).toUpperCase() || 'А')}
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
            />
            <Typography
              variant='body2'
              color='primary'
              sx={{ 
                cursor: uploading ? 'default' : 'pointer',
                mt: 1 
              }}
              onClick={handleAvatarClick}
            >
              {uploading ? 'Загрузка...' : 'сменить аватар'}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant='body1' sx={{ mb: 2 }}>
              <strong>Номер телефона:</strong> {user?.phone || ' Error'}
            </Typography>

            <Typography
              variant='body1'
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
            >
              <span>
                <strong>Имя:</strong> {fullName || ' Error'}
              </span>
              <Button variant='text' color='primary' size='small'>
                сменить имя
              </Button>
            </Typography>

            <Typography
              variant='body1'
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
            >
              <span>
                <strong>Почта:</strong> {user?.email || ' Error'}
              </span>
              <Button variant='text' color='primary' size='small'>
                сменить почту
              </Button>
            </Typography>

            <Typography
              variant='body1'
              sx={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <span>
                <strong>Пароль:</strong> ********
              </span>
              <Button variant='text' color='primary' size='small'>
                сменить пароль
              </Button>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ border: '1px solid #ddd', borderRadius: 3, p: 2, mt: 2 }}>
          <List>
            {['Избранное', 'История', 'Статистика'].map((text, index) => (
              <ListItem key={index} secondaryAction={<AddIcon />}>
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
}
