import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
} from '@mui/material';
import { useState, useRef } from 'react';
import { updateAvatar, updateUserProfile } from '../../redux/thunkActions';

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [uploading, setUploading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [surname, setSurname] = useState(user?.surname || '');
  const [name, setName] = useState(user?.name || '');
  const [patronymic, setPatronymic] = useState(user?.patronymic || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    
    setUploading(true);
    dispatch(updateAvatar(formData)).finally(() => {
      setUploading(false);
    });
  };

  const handleSaveName = () => {
    dispatch(updateUserProfile({ surname, name, patronymic }));
    setIsEditingName(false);
  };

  const handleSavePhone = () => {
    dispatch(updateUserProfile({ phone }));
    setIsEditingPhone(false);
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
              src={user?.avatar ? `${import.meta.env.VITE_TARGET}${user.avatar}` : undefined}
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
            <Typography variant='body1' sx={{ mb: 2, color: 'grey' }}>
              {user?.email || ' Error'}
            </Typography>

            <Typography
              variant='body1'
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
            >
              <span>
                <strong>Имя:</strong> 
                {isEditingName ? (
                  <>
                    <TextField
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      size="small"
                      label="Фамилия"
                    />
                    <TextField
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      size="small"
                      label="Имя"
                    />
                    <TextField
                      value={patronymic}
                      onChange={(e) => setPatronymic(e.target.value)}
                      size="small"
                      label="Отчество"
                    />
                    <Button variant='text' color='primary' size='small' onClick={handleSaveName}>
                      сохранить
                    </Button>
                  </>
                ) : (
                  <>
                    {`${surname} ${name} ${patronymic}`.trim() || ' Error'}
                    <Button variant='text' color='primary' size='small' onClick={() => setIsEditingName(true)}>
                      сменить имя
                    </Button>
                  </>
                )}
              </span>
            </Typography>

            <Typography
              variant='body1'
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
            >
              <span>
                <strong>Номер телефона:</strong> 
                {isEditingPhone ? (
                  <>
                    <TextField
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      size="small"
                    />
                    <Button variant='text' color='primary' size='small' onClick={handleSavePhone}>
                      сохранить
                    </Button>
                  </>
                ) : (
                  <>
                    {phone || ' Error'}
                    <Button variant='text' color='primary' size='small' onClick={() => setIsEditingPhone(true)}>
                      сменить номер телефона
                    </Button>
                  </>
                )}
              </span>
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant='text' color='error' size='small'>
                сменить пароль
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
