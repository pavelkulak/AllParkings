import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  Switch,
  CircularProgress,
} from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  updateAvatar,
  updateUserProfile,
  changePassword,
  deleteAvatar,
  deleteAccount,
} from '../../redux/thunkActions';
import { getFavorites, removeFromFavorites } from '../../redux/favoritesThunks';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';
import LightModeSharpIcon from '@mui/icons-material/LightModeSharp';
import DarkModeSharpIcon from '@mui/icons-material/DarkModeSharp';
import { useTheme } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import { Tooltip } from '@mui/material';
import InputMask from 'react-input-mask';
import { Card, CardContent, CardMedia, Rating } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const { favorites, status } = useAppSelector((state) => state.favorites);
  const navigate = useNavigate();

  const theme = useTheme();
  // Изменение темы на будущее
  // const toggleTheme = () => {
  // };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        'Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.',
      )
    ) {
      dispatch(deleteAccount());
      navigate('/');
    }
  };

  const isFieldsValid = () => {
    const isSurnameValid = surname.length >= 2;
    const isNameValid = name.length >= 2;
    const isPatronymicValid = !patronymic || patronymic.length >= 2;
    const isPhoneValid = phone && !phone.includes('_');

    return isSurnameValid && isNameValid && isPatronymicValid && isPhoneValid;
  };

  useEffect(() => {
    const cleanedCurrentPhone = phone.replace(/\D/g, '');
    const cleanedOriginalPhone = user?.phone?.toString() || '';

    setIsChanged(
      (surname !== user?.surname ||
        name !== user?.name ||
        patronymic !== user?.patronymic ||
        cleanedCurrentPhone !== cleanedOriginalPhone) &&
        isFieldsValid(),
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

  // Функция для очистки номера телефона от форматирования
  const cleanPhoneNumber = (phone: string) => {
    // Оставляем только цифры, включая 7 в начале
    return phone.replace(/\D/g, '');
  };

  // Обновляем функцию сохранения
  const handleSaveChanges = () => {
    if (surnameError || nameError || patronymicError || phoneError) {
      return;
    }

    // Очищаем телефон от форматирования перед отправкой
    const cleanedPhone = cleanPhoneNumber(phone);

    dispatch(
      updateUserProfile({
        surname,
        name,
        patronymic,
        phone: cleanedPhone, // Теперь будет в формате "79951000000"
      }),
    );
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

  const handleNewPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const password = e.target.value;
    setNewPassword(password);
    setNewPasswordError(validatePassword(password));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const confirmPass = e.target.value;
    setConfirmPassword(confirmPass);
    setConfirmPasswordError(
      confirmPass !== newPassword ? 'Пароли должны совпадать' : '',
    );
  };

  const [surnameError, setSurnameError] = useState('');
  const [nameError, setNameError] = useState('');
  const [patronymicError, setPatronymicError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validateName = (value: string, fieldName: string) => {
    if (value && value.length < 2) {
      return `${fieldName} должно содержать минимум 2 буквы`;
    }
    if (value && !/^[а-яА-ЯёЁa-zA-Z]+$/.test(value)) {
      return `${fieldName} должно содержать только буквы`;
    }
    return '';
  };

  const handleSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSurname(value);
    setSurnameError(validateName(value, 'Фамилия'));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setNameError(validateName(value, 'Имя'));
  };

  const handlePatronymicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPatronymic(value);
    setPatronymicError(value ? validateName(value, 'Отчество') : '');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    setPhoneError(value.includes('_') ? 'Введите полный номер телефона' : '');
  };

  useEffect(() => {
    if (user?.phone) {
      const formattedPhone = user.phone
        .toString()
        .replace(/(\d)(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5');
      setPhone(formattedPhone);
    }
  }, [user]);

  const handleDeleteAvatar = () => {
    if (window.confirm('Вы уверены, что хотите удалить аватар?')) {
      dispatch(deleteAvatar())
        .unwrap()
        .then(() => {})
        .catch((error) => {
          alert(error || 'Ошибка при удалении аватара');
        });
    }
  };

  useEffect(() => {
    if (activeTab === 'favorites') {
      dispatch(getFavorites());
    }
  }, [activeTab, dispatch]);

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
        <Button
          onClick={() => setActiveTab('settings')}
          variant={activeTab === 'settings' ? 'contained' : 'outlined'}
        >
          Настройки
        </Button>
        <Button
          onClick={() => setActiveTab('favorites')}
          variant={activeTab === 'favorites' ? 'contained' : 'outlined'}
        >
          Избранное
        </Button>
        <Button
          onClick={() => setActiveTab('history')}
          variant={activeTab === 'history' ? 'contained' : 'outlined'}
        >
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
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
                onClick={handleDeleteAvatar}
              >
                Удалить аватар
              </Typography>
            )}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant='body1' sx={{ mb: 2, color: 'grey' }}>
              {user?.email || ' Error'}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: '28px',
                  display: 'flex',
                  justifyContent: 'center',
                  visibility: surnameError ? 'visible' : 'hidden',
                }}
              >
                <Tooltip title={surnameError} arrow>
                  <InfoIcon
                    color='error'
                    sx={{ fontSize: '24px', cursor: 'pointer' }}
                  />
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                value={surname}
                onChange={handleSurnameChange}
                size='small'
                label='Фамилия'
                variant='standard'
                required
                error={!!surnameError}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: '28px',
                  display: 'flex',
                  justifyContent: 'center',
                  visibility: nameError ? 'visible' : 'hidden',
                }}
              >
                <Tooltip title={nameError} arrow>
                  <InfoIcon
                    color='error'
                    sx={{ fontSize: '24px', cursor: 'pointer' }}
                  />
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                value={name}
                onChange={handleNameChange}
                size='small'
                label='Имя'
                variant='standard'
                required
                error={!!nameError}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: '28px',
                  display: 'flex',
                  justifyContent: 'center',
                  visibility: patronymicError ? 'visible' : 'hidden',
                }}
              >
                <Tooltip title={patronymicError} arrow>
                  <InfoIcon
                    color='error'
                    sx={{ fontSize: '24px', cursor: 'pointer' }}
                  />
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                value={patronymic}
                onChange={handlePatronymicChange}
                size='small'
                label='Отчество'
                variant='standard'
                error={!!patronymicError}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: '28px',
                  display: 'flex',
                  justifyContent: 'center',
                  visibility: phoneError ? 'visible' : 'hidden',
                }}
              >
                <Tooltip title={phoneError} arrow>
                  <InfoIcon
                    color='error'
                    sx={{ fontSize: '24px', cursor: 'pointer' }}
                  />
                </Tooltip>
              </Box>
              <InputMask
                mask='+7 999 999 99 99'
                value={phone}
                onChange={handlePhoneChange}
                maskChar='_'
              >
                {(inputProps: any) => (
                  <TextField
                    {...inputProps}
                    fullWidth
                    size='small'
                    label='Номер телефона'
                    variant='standard'
                    required
                    error={!!phoneError}
                  />
                )}
              </InputMask>
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
              px: 1,
              minHeight: '100%',
              width: '25%',
            }}
          >
            <Typography variant='h6' sx={{ mb: 3 }}>
              Смена пароля
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: '28px',
                  display: 'flex',
                  justifyContent: 'center',
                  visibility: 'hidden',
                }}
              >
                <InfoIcon sx={{ fontSize: '24px' }} />
              </Box>
              <TextField
                fullWidth
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                size='small'
                label='Ваш пароль'
                variant='standard'
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='start'>
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
                }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: '28px',
                  display: 'flex',
                  justifyContent: 'center',
                  visibility: newPasswordError ? 'visible' : 'hidden',
                }}
              >
                <Tooltip title={newPasswordError} arrow>
                  <InfoIcon
                    color='error'
                    sx={{
                      fontSize: '24px',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                  />
                </Tooltip>
              </Box>
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
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='start'>
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge='end'
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: '28px',
                  display: 'flex',
                  justifyContent: 'center',
                  visibility: confirmPasswordError ? 'visible' : 'hidden',
                }}
              >
                <Tooltip title={confirmPasswordError} arrow>
                  <InfoIcon
                    color='error'
                    sx={{
                      fontSize: '24px',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                  />
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                type='password'
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                size='small'
                label='Подтвердите пароль'
                variant='standard'
                required
                error={!!confirmPasswordError}
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
              <Typography variant='body2'>Light</Typography>
              <Switch
                // checked={theme.palette.mode === 'dark'}
                // onChange={toggleTheme}
                color='default'
              />
              <DarkModeSharpIcon />
              <Typography variant='body2'>Dark</Typography>
            </Box>
            <Button
              variant='outlined'
              color='error'
              onClick={handleDeleteAccount}
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
            <Typography variant='h6' sx={{ mb: 2 }}>
              Избранные парковки
            </Typography>
            {status === 'loading' && <CircularProgress />}
            {status === 'succeeded' && favorites?.length === 0 && (
              <Typography>У вас пока нет избранных парковок</Typography>
            )}
            {status === 'succeeded' && favorites?.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {favorites.map((favorite) => (
                  <Card key={favorite.id} sx={{ position: 'relative' }}>
                    <CardMedia
                      component='img'
                      height='140'
                      image={
                        favorite.ParkingLot?.img
                          ? `${import.meta.env.VITE_API_URL}/img/parking/${
                              favorite.ParkingLot.img
                            }`
                          : '/default-parking.jpg'
                      }
                      alt={favorite.ParkingLot?.name}
                    />
                    <CardContent>
                      <Typography variant='h6' noWrap>
                        {favorite.ParkingLot?.name}
                      </Typography>
                      <Typography variant='body2' color='text.secondary' noWrap>
                        {favorite.ParkingLot?.location?.address}
                      </Typography>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Rating
                          value={
                            Number(favorite.ParkingLot?.average_rating) || 0
                          }
                          readOnly
                          size='small'
                        />
                        <Typography variant='body2'>
                          {favorite.ParkingLot?.price_per_hour} ₽/час
                        </Typography>
                      </Box>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          color: 'red', // или '#FF0000', или 'error.main' если используете тему Material UI
                        }}
                        onClick={() =>
                          dispatch(removeFromFavorites(favorite.parking_id))
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
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
