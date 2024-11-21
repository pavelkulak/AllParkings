import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  Switch,
  CircularProgress,
  Stack,
  CardActionArea,
  Dialog,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  LinearProgress,
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
import InfoIcon from '@mui/icons-material/Info';
import { Tooltip } from '@mui/material';
import InputMask from 'react-input-mask';
import { Card, CardContent, CardMedia, Rating } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  getBookingHistory,
  getActiveBookings,
  cancelBooking,
} from '../../redux/bookingThunks';
import { Tabs, Tab } from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import { ParkingSpacePreview } from '../parking/ParkingSpacePreview';
import MapIcon from '@mui/icons-material/Map';
import { useThemeContext } from '../theme/ThemeContext';
import { useTheme } from '@mui/material/styles';
import { Grid } from '@mui/material';

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
  const { activeBookings, bookingHistory } = useAppSelector(
    (state) => state.booking,
  );
  const navigate = useNavigate();
  const [historyTab, setHistoryTab] = useState<'active' | 'history'>('active');
  const [showParkingModal, setShowParkingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { mode, toggleTheme } = useThemeContext();

  const theme = useTheme();

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [progress, setProgress] = useState(100);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

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
    const isPhoneValid = phone && !phone.includes('_');

    return isSurnameValid && isNameValid && isPhoneValid;
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

  const cleanPhoneNumber = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const handleSaveChanges = () => {
    if (surnameError || nameError || patronymicError || phoneError) {
      return;
    }

    const cleanedPhone = cleanPhoneNumber(phone);

    dispatch(updateUserProfile({
      surname,
      name,
      patronymic,
      phone: cleanedPhone,
    }))
      .unwrap()
      .then(() => {
        setSnackbarMessage('Данные успешно обновлены');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      })
      .catch((error) => {
        setSnackbarMessage(error || 'Произошла ошибка при обновлении данных');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSnackbarMessage('Пожалуйста, заполните все поля');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setSnackbarMessage(passwordError);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbarMessage('Новый пароль и подтверждение не совпадают');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    dispatch(changePassword({ currentPassword, newPassword }))
      .unwrap()
      .then(() => {
        setSnackbarMessage('Пароль успешно изменен');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setNewPasswordError('');
        setConfirmPasswordError('');
      })
      .catch((error) => {
        setSnackbarMessage(error || 'Ошибка при изменении пароля');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
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
    if (activeTab === 'history') {
      dispatch(getBookingHistory());
      dispatch(getActiveBookings());
    }
  }, [activeTab, dispatch]);

  const handleParkingClick = (parking: object) => {
    navigate('/parkings/map', { state: { selectedParking: parking } });
  };

  useEffect(() => {
    if (openSnackbar) {
      setProgress(100);
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prevProgress - (100 / 60);
        });
      }, 100);

      return () => {
        clearInterval(timer);
      };
    }
  }, [openSnackbar]);
    
  const [gridSize, setGridSize] = useState('medium');

  const handleCancelBooking = (bookingId: number) => {
    dispatch(cancelBooking(bookingId))
      .unwrap()
      .then(() => {
        setSnackbarMessage('Бронирование успешно отменено');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      })
      .catch((error) => {
        setSnackbarMessage(error.message || 'Произошла ошибка при отмене бронирования');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, gap: 2 }}>
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
                {(inputProps) => (
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
                label='Подтвердите парль'
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
                checked={mode === 'dark'}
                onChange={toggleTheme}
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
                    <CardActionArea onClick={() => handleParkingClick(favorite)}>
                      <CardMedia
                        component='img'
                        height='140'
                        image={
                          favorite.img
                            ? `${import.meta.env.VITE_API_URL}/img/parking/${favorite.img}`
                            : 'parking-default.jpg'
                        }
                        alt={favorite.name}
                      />
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {favorite.name}
                        </Typography>
                        <Typography variant='body2' color='text.secondary' noWrap>
                          {favorite.location?.address}
                        </Typography>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Rating
                            value={Number(favorite.average_rating) || 0}
                            readOnly
                            size='small'
                          />
                          <Typography variant='body2'>
                            {favorite.price_per_hour} ₽/час
                          </Typography>
                        </Box>
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: 'red',
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            padding: '4px',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.9)',
                            },
                          }}
                          onClick={() =>
                            dispatch(removeFromFavorites(favorite.id))
                          }
                        >
                          <CloseIcon />
                        </IconButton>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}

        {activeTab === 'history' && (
          <Box sx={{ border: '1px solid #ddd', borderRadius: 3, p: 3, mt: 2 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              История бронирований
            </Typography>

            <Tabs
              value={historyTab}
              onChange={(_, value) => setHistoryTab(value)}
              sx={{ mb: 2 }}
            >
              <Tab label='Активные' value='active' />
              <Tab label='История' value='history' />
            </Tabs>

            {historyTab === 'active' ? (
              <Stack spacing={2}>
                {activeBookings.length === 0 ? (
                  <Typography>У вас нет активных бронирований</Typography>
                ) : (
                  activeBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant='h6'>
                            {booking.ParkingSpace?.ParkingLot?.name || 'Неизвестно'}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Button 
                              variant="outlined" 
                              size="small"
                              startIcon={<MapIcon />}
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowParkingModal(true);
                              }}
                            >
                              Схема
                            </Button>
                            <Button 
                              variant="outlined"
                              size="small" 
                              startIcon={<DirectionsIcon />}
                              onClick={() => {
                                const parkingLot = booking.ParkingSpace?.ParkingLot;
                                if (parkingLot?.id) {
                                  handleParkingClick(parkingLot);
                                }
                              }}
                            >
                              Маршрут
                            </Button>
                            <Button 
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Отменить
                            </Button>
                          </Stack>
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ 
                              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.default' : 'grey.100',
                              p: 2, 
                              borderRadius: 1,
                              boxShadow: (theme) => theme.palette.mode === 'dark' ? 'none' : 1,
                              height: '100%'
                            }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Информация о парковке
                              </Typography>
                              <Stack spacing={1}>
                                <Typography>
                                  Место: {booking.ParkingSpace?.space_number || 'Неизвестно'}
                                </Typography>
                                <Typography>
                                  Адрес: {booking.ParkingSpace?.ParkingLot?.location?.address || 'Неизвестно'}
                                </Typography>
                                <Typography>
                                  Стоимость: {booking.ParkingSpace?.ParkingLot?.price_per_hour || 'Неизвестно'} ₽/час
                                </Typography>
                              </Stack>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ 
                              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.default' : 'grey.100',
                              p: 2, 
                              borderRadius: 1,
                              boxShadow: (theme) => theme.palette.mode === 'dark' ? 'none' : 1,
                              height: '100%'
                            }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Время бронирования
                              </Typography>
                              <Stack spacing={1}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Заезд:
                                  </Typography>
                                  <Typography>
                                    {new Date(booking.start_time).toLocaleString('ru-RU', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                    {' '}в{' '}
                                    {new Date(booking.start_time).toLocaleString('ru-RU', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Выезд:
                                  </Typography>
                                  <Typography>
                                    {new Date(booking.end_time).toLocaleString('ru-RU', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                    {' '}в{' '}
                                    {new Date(booking.end_time).toLocaleString('ru-RU', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Stack>
            ) : (
              <Stack spacing={2}>
                {bookingHistory.length === 0 ? (
                  <Typography>История бронирований пуста</Typography>
                ) : (
                  bookingHistory.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant='h6'>
                            {booking.ParkingSpace?.ParkingLot?.name || 'Неизвестно'}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Button 
                              variant="outlined" 
                              size="small"
                              startIcon={<MapIcon />}
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowParkingModal(true);
                              }}
                            >
                              Схема
                            </Button>
                            <Button 
                              variant="outlined"
                              size="small" 
                              startIcon={<DirectionsIcon />}
                              onClick={() => {
                                const parkingLot = booking.ParkingSpace?.ParkingLot;
                                if (parkingLot?.id) {
                                  handleParkingClick(parkingLot);
                                }
                              }}
                            >
                              Маршрут
                            </Button>
                            <Button 
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Отменить
                            </Button>
                          </Stack>
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ 
                              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.default' : 'grey.100',
                              p: 2, 
                              borderRadius: 1,
                              boxShadow: (theme) => theme.palette.mode === 'dark' ? 'none' : 1,
                              height: '100%'
                            }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Информация о парковке
                              </Typography>
                              <Stack spacing={1}>
                                <Typography>
                                  Место: {booking.ParkingSpace?.space_number || 'Неизвестно'}
                                </Typography>
                                <Typography>
                                  Адрес: {booking.ParkingSpace?.ParkingLot?.location?.address || 'Неизвестно'}
                                </Typography>
                                <Typography>
                                  Стоимость: {booking.ParkingSpace?.ParkingLot?.price_per_hour || 'Неизвестно'} ₽/час
                                </Typography>
                              </Stack>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ 
                              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.default' : 'grey.100',
                              p: 2, 
                              borderRadius: 1,
                              boxShadow: (theme) => theme.palette.mode === 'dark' ? 'none' : 1,
                              height: '100%'
                            }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Время бронирования
                              </Typography>
                              <Stack spacing={1}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Заезд:
                                  </Typography>
                                  <Typography>
                                    {new Date(booking.start_time).toLocaleString('ru-RU', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                    {' '}в{' '}
                                    {new Date(booking.start_time).toLocaleString('ru-RU', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Выезд:
                                  </Typography>
                                  <Typography>
                                    {new Date(booking.end_time).toLocaleString('ru-RU', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                    {' '}в{' '}
                                    {new Date(booking.end_time).toLocaleString('ru-RU', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Stack>
            )}
          </Box>
        )}
      </Box>

      {showParkingModal && selectedBooking?.ParkingSpace?.ParkingLot && (
  console.log('Selected booking:', {
    parkingId: selectedBooking.ParkingSpace.ParkingLot.id,
    spaceId: selectedBooking.ParkingSpace.id,
    booking: selectedBooking
  }),
  <Dialog 
    open={showParkingModal} 
    onClose={() => setShowParkingModal(false)}
    maxWidth={false}
    PaperProps={{
      sx: {
        width: (theme) => ({
          small: '700px',
          medium: '900px',
          large: '1100px'
        })[gridSize],
        maxWidth: '90vw',
        maxHeight: '90vh'
      }
    }}
  >
          <DialogTitle>
            Схема парковки
            <IconButton
              aria-label="close"
              onClick={() => setShowParkingModal(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <ParkingSpacePreview 
              parkingId={Number(selectedBooking.ParkingSpace.ParkingLot.id)}
              highlightedSpaceId={Number(selectedBooking.space_id)}
              onGridSizeChange={setGridSize}
            />
          </DialogContent>
        </Dialog>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          mt: 7,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            variant="filled"
            sx={{
              width: '100%',
              borderRadius: 2,
              '& .MuiAlert-message': {
                minWidth: '200px',
              },
            }}
          >
            {snackbarMessage}
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            />
          </Alert>
        </Box>
      </Snackbar>
    </Box>
  );
}
