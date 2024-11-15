import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { Box, Typography, Avatar, Button, TextField, Switch } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { updateAvatar, updateUserProfile, changePassword } from '../../redux/thunkActions';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';
import LightModeSharpIcon from '@mui/icons-material/LightModeSharp';
import DarkModeSharpIcon from '@mui/icons-material/DarkModeSharp';
import { useTheme } from '@mui/material/styles';

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [uploading, setUploading] = useState(false);
  const [surname, setSurname] = useState(user?.surname || '');
  const [name, setName] = useState(user?.name || '');
  const [patronymic, setPatronymic] = useState(user?.patronymic || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanged, setIsChanged] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState('settings');

  const theme = useTheme();
  // Изменение темы на будущее
  // const toggleTheme = () => {
  // };

  // Удаление аккаунта на будущее
  // const handleDeleteAccount = () => {
  //   if (window.confirm('Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.')) {
  //     alert('Аккаунт удален');
  //   }
  // };

  useEffect(() => {
    setIsChanged(
      surname !== user?.surname ||
        name !== user?.name ||
        patronymic !== user?.patronymic ||
        phone !== user?.phone,
    );
  }, [surname, name, patronymic, phone, user]);

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

  const handleSaveChanges = () => {
    dispatch(updateUserProfile({ surname, name, patronymic, phone }));
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      alert(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Новый пароль и подтверждение не совпадают');
      return;
    }

    dispatch(changePassword({ currentPassword, newPassword }))
      .unwrap()
      .then(() => {
        alert('Пароль успешно изменен');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setNewPasswordError('');
        setConfirmPasswordError('');
      })
      .catch((error) => {
        alert(error || 'Ошибка при изменении пароля');
      });
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Пароль должен содержать минимум 8 символов';
    }
    return '';
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const password = e.target.value;
    setNewPassword(password);
    setNewPasswordError(validatePassword(password));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const confirmPass = e.target.value;
    setConfirmPassword(confirmPass);
    setConfirmPasswordError(confirmPass !== newPassword ? 'Пароли должны совпадать' : '');
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button onClick={() => setActiveTab('settings')} variant={activeTab === 'settings' ? 'contained' : 'outlined'}>
          Настройки
        </Button>
        <Button onClick={() => setActiveTab('favorites')} variant={activeTab === 'favorites' ? 'contained' : 'outlined'}>
          Избранное
        </Button>
        <Button onClick={() => setActiveTab('history')} variant={activeTab === 'history' ? 'contained' : 'outlined'}>
          История
        </Button>
      </Box>

      <Box sx={{ display: 'flex', width: '80%', flexDirection: 'column' }}>
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
              width: '25%',
            }}
          >
            <Avatar
              src={
                user?.avatar
                  ? `${import.meta.env.VITE_TARGET}${user.avatar}`
                  : undefined
              }
              sx={{
                width: 200,
                height: 200,
                bgcolor: 'lightblue',
                fontSize: '100px',
              }}
            >
              {!user?.avatar && (user?.name.charAt(0).toUpperCase() || 'А')}
            </Avatar>
            <input
              type='file'
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept='image/*'
              onChange={handleFileChange}
            />
            <Typography
              variant='body1'
              color='primary'
              sx={{
                cursor: uploading ? 'default' : 'pointer',
                mt: 1,
              }}
              onClick={handleAvatarClick}
            >
              {uploading ? 'Загрузка...' : 'Сменить аватар'}
            </Typography>
            {user?.avatar && (
              <Typography
                variant='body2'
                color='error'
                sx={{
                  cursor: 'pointer',
                  mt: 1,
                }}
              >
                Удалить аватар (не создан)
              </Typography>
            )}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant='body1' sx={{ mb: 2, color: 'grey' }}>
              {user?.email || ' Error'}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                size='small'
                label='Фамилия'
                variant='standard'
                required
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                size='small'
                label='Имя'
                variant='standard'
                required
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                value={patronymic}
                onChange={(e) => setPatronymic(e.target.value)}
                size='small'
                label='Отчество'
                variant='standard'
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                size='small'
                label='Номер телефона'
                variant='standard'
                required
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
              <Button
                variant='contained'
                color='primary'
                size='medium'
                disabled={!isChanged}
                onClick={handleSaveChanges}
              >
                Сохранить изменения
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderLeft: '1px solid #ddd',
              px: 5,
              minHeight: '100%',
              width: '25%',
            }}
          >
            <Typography variant='h6' sx={{ mb: 3 }}>
              Смена пароля
            </Typography>
            <Box sx={{ width: '100%', mb: 2 }}>
              <TextField
                fullWidth
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                size='small'
                label='Ваш пароль'
                variant='standard'
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          edge='end'
                        >
                          {showCurrentPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
            <Box sx={{ width: '100%', mb: 2 }}>
              <TextField
                fullWidth
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={handleNewPasswordChange}
                size='small'
                label='Новый пароль'
                variant='standard'
                required
                error={!!newPasswordError}
                helperText={newPasswordError}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge='end'
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
            <Box sx={{ width: '100%', mb: 2 }}>
              <TextField
                sx={{ marginBottom: '35px' }}
                fullWidth
                type='password'
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                size='small'
                label='Подтвердите пароль'
                variant='standard'
                onPaste={(e) => {
                  e.preventDefault();
                  alert('Вставка запрещена. Пожалуйста, введите пароль вручную.');
                }}
                required
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
              />
            </Box>
            <Button
              variant='contained'
              color='primary'
              size='medium'
              onClick={handleChangePassword}
              disabled={
                !currentPassword || 
                !newPassword || 
                !confirmPassword || 
                !!newPasswordError ||
                !!confirmPasswordError
              }
            >
              Изменить пароль
            </Button>
          </Box>
        </Box>

        {activeTab === 'settings' && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid #ddd',
              borderRadius: 3,
              p: 3,
              mt: 2,
            }}
          >
            <Typography variant='h6'>Настройки</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LightModeSharpIcon />
              <Typography variant="body2">Light</Typography>
              <Switch
                // checked={theme.palette.mode === 'dark'}
                // onChange={toggleTheme}
                color="default"
              />
              <DarkModeSharpIcon />
              <Typography variant="body2">Dark</Typography>
            </Box>
            <Button
              variant='contained'
              color='error'
              // onClick={handleDeleteAccount}
            >
              Удалить аккаунт
            </Button>
          </Box>
        )}

        {activeTab === 'favorites' && (
          <Box
            sx={{
              border: '1px solid #ddd',
              borderRadius: 3,
              p: 3,
              mt: 2,
            }}
          >
            <Typography variant='h6'>Здесь будет избранное</Typography>
          </Box>
        )}

        {activeTab === 'history' && (
          <Box
            sx={{
              border: '1px solid #ddd',
              borderRadius: 3,
              p: 3,
              mt: 2,
            }}
          >
            <Typography variant='h6'>Здесь будет история</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
