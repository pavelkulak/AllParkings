import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { Booking } from '../../types/booking';
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Stack,
  CardActionArea,
  Dialog,
  DialogContent,
  DialogTitle,
  Switch,
  Container,
  Divider,
  Tabs,
  Tab,
  ListItemButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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

import InputMask from 'react-input-mask';
import { Card, CardContent, CardMedia, Rating, Grid, List, ListItem, ListItemIcon, ListItemText, Paper, useMediaQuery } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import {
  getBookingHistory,
  getActiveBookings,
  cancelBooking,
} from '../../redux/bookingThunks';
import KeyIcon from '@mui/icons-material/Key';
import DirectionsIcon from '@mui/icons-material/Directions';
import LightModeSharpIcon from '@mui/icons-material/LightModeSharp';
import DarkModeSharpIcon from '@mui/icons-material/DarkModeSharp';
import MapIcon from '@mui/icons-material/Map';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useThemeContext } from '../theme/ThemeContext';
import { ParkingSpacePreview } from '../parking/ParkingSpacePreview';

import { showNotification } from '../../redux/slices/uiSlice';

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
  const [activeTab, setActiveTab] = useState('profile');
  const { favorites, status } = useAppSelector((state) => state.favorites);
  const { activeBookings, bookingHistory } = useAppSelector(
    (state) => state.booking,
  );
  const navigate = useNavigate();
  const [historyTab, setHistoryTab] = useState<'active' | 'history'>('active');
  const [showParkingModal, setShowParkingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { mode, toggleTheme } = useThemeContext();

  const theme = useTheme();

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
      Boolean((surname !== user?.surname ||
        name !== user?.name ||
        patronymic !== user?.patronymic ||
        cleanedCurrentPhone !== cleanedOriginalPhone) &&
        isFieldsValid()),
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
        dispatch(showNotification({ message: 'Данные успешно обновлены', severity: 'success' }));
      })
      .catch((error) => {
        dispatch(showNotification({ message: error || 'Произошла ошибка при обновлении данных', severity: 'error' }));
      });
  };

  const handleChangePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      dispatch(showNotification({ message: 'Пожалуйста, заполните все поля', severity: 'error' }));
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      dispatch(showNotification({ message: passwordError, severity: 'error' }));
      return;
    }

    if (newPassword !== confirmPassword) {
      dispatch(showNotification({ message: 'Новый пароль и подтверждение не совпадают', severity: 'error' }));
      return;
    }

    dispatch(changePassword({ currentPassword, newPassword }))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: 'Пароль успешно изменен', severity: 'success' }));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setNewPasswordError('');
        setConfirmPasswordError('');
      })
      .catch((error) => {
        dispatch(showNotification({ message: error || 'Ошибка при изменении пароля', severity: 'error' }));
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
        .then(() => {
          dispatch(showNotification({ message: 'Аватар успешно удален', severity: 'success' }));
        })
        .catch((error) => {
          dispatch(showNotification({ message: error || 'Ошибка при удалении аватара', severity: 'error' }));
        });
    }
  };

  useEffect(() => {
    if (activeTab === 'favorites') {
      dispatch(getFavorites());
    }
    if (activeTab === 'bookings') {

      dispatch(getActiveBookings());
    }
    if (activeTab === 'history') {
      dispatch(getBookingHistory());
    }
  }, [activeTab, dispatch]);

  const handleParkingClick = (parking: object) => {
    navigate('/parkings/map', { state: { selectedParking: parking } });
  };

  const handleRemoveFromFavorites = (favoriteId: number) => {
    dispatch(removeFromFavorites(favoriteId))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: 'Парковка удалена из избранного', severity: 'success' }));
      })
      .catch((error) => {
        dispatch(showNotification({ message: error.message || 'Ошибка при удалении из избранного', severity: 'error' }));
      });
  };



  const [gridSize, setGridSize] = useState('medium');

  const handleCancelBooking = (bookingId: number) => {
    dispatch(cancelBooking(bookingId))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: 'Бронирование успешно отменено', severity: 'success' }));
      })
      .catch((error) => {
        dispatch(showNotification({ message: error.message || 'Произошла ошибка при отмене бронирования', severity: 'error' }));
      });
  };

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { id: 'profile', label: 'Профиль', icon: <PersonIcon /> },
    { id: 'bookings', label: 'Бронирования', icon: <HistoryIcon /> },
    { id: 'favorites', label: 'Избранное', icon: <FavoriteIcon /> },
    { id: 'security', label: 'Безопасность', icon: <SecurityIcon /> },
    { id: 'settings', label: 'Настройки', icon: <SettingsIcon /> },
  ];


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Grid container spacing={3}>
        {/* Sidebar Navigation */}
        <Grid item xs={12} md={3}>
          <Paper
            elevation={2}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              position: { md: 'sticky' },
              top: { md: 100 },
              bgcolor: 'background.paper',
            }}
          >
            {isMobile ? (
              <Tabs
                value={activeTab}
                onChange={(_, value) => setActiveTab(value)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                }}
              >
                {menuItems.map((item) => (
                  <Tab
                    key={item.id}
                    value={item.id}
                    label={item.label}
                    icon={item.icon}
                    iconPosition="start"
                    sx={{ minHeight: 64, textTransform: 'none', fontWeight: 600 }}
                  />
                ))}
              </Tabs>
            ) : (
              <List component="nav" sx={{ py: 0 }}>
                {menuItems.map((item) => (
                  <ListItem key={item.id} disablePadding>
                    <ListItemButton
                      selected={activeTab === item.id}
                      onClick={() => setActiveTab(item.id)}
                      sx={{
                        py: 1.5,
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          '& .MuiListItemIcon-root': { color: 'white' },
                          '&:hover': { bgcolor: 'primary.dark' },
                        },
                        px: 3,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: activeTab === item.id ? 'white' : 'primary.main' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: activeTab === item.id ? 600 : 500
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
                <Divider />
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={handleDeleteAccount}
                    sx={{ py: 1.5, px: 3, color: 'error.main' }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                      <DeleteForeverIcon />
                    </ListItemIcon>
                    <ListItemText primary="Удалить аккаунт" />
                  </ListItemButton>
                </ListItem>
              </List>
            )}
          </Paper>
        </Grid>

        {/* Content Area */}
        <Grid item xs={12} md={9}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 4,
              minHeight: '600px',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
            }}
          >
            {activeTab === 'profile' && (
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
                  Личные данные
                </Typography>

                <Grid container spacing={4}>
                  <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar
                        src={user?.avatar ? `${import.meta.env.VITE_TARGET}${user.avatar}` : undefined}
                        sx={{
                          width: 180,
                          height: 180,
                          bgcolor: 'primary.light',
                          fontSize: '80px',
                          border: '4px solid white',
                          boxShadow: 3,
                        }}
                      >
                        {!user?.avatar && (user?.name.charAt(0).toUpperCase() || 'А')}
                      </Avatar>
                      <IconButton
                        onClick={handleAvatarClick}
                        sx={{
                          position: 'absolute',
                          bottom: 5,
                          right: 5,
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' },
                          boxShadow: 2,
                        }}
                        size="small"
                      >
                        <SettingsIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        onClick={handleAvatarClick}
                        disabled={uploading}
                        sx={{ textTransform: 'none' }}
                      >
                        {uploading ? 'Загрузка...' : 'Изменить фото'}
                      </Button>
                      {user?.avatar && (
                        <Button
                          size="small"
                          color="error"
                          onClick={handleDeleteAvatar}
                          sx={{ textTransform: 'none', ml: 1 }}
                        >
                          Удалить
                        </Button>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {user?.email}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Stack spacing={3}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          fullWidth
                          label="Фамилия"
                          value={surname}
                          onChange={handleSurnameChange}
                          error={!!surnameError}
                          helperText={surnameError}
                        />
                        <TextField
                          fullWidth
                          label="Имя"
                          value={name}
                          onChange={handleNameChange}
                          error={!!nameError}
                          helperText={nameError}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        label="Отчество"
                        value={patronymic}
                        onChange={handlePatronymicChange}
                        error={!!patronymicError}
                        helperText={patronymicError}
                      />
                      <InputMask
                        mask="+7 999 999 99 99"
                        value={phone}
                        onChange={handlePhoneChange}
                      >
                        {(inputProps: any) => (
                          <TextField
                            {...inputProps}
                            fullWidth
                            label="Номер телефона"
                            error={!!phoneError}
                            helperText={phoneError}
                          />
                        )}
                      </InputMask>
                      <Box sx={{ pt: 2 }}>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<SaveIcon />}
                          disabled={!isChanged}
                          onClick={handleSaveChanges}
                          sx={{ px: 4, borderRadius: 2 }}
                        >
                          Сохранить профиль
                        </Button>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeTab === 'security' && (
              <Box maxWidth="500px">
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
                  Безопасность
                </Typography>

                <Card sx={{ p: 3, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }} elevation={0}>
                  <Stack spacing={3}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                      <KeyIcon color="primary" />
                      <Typography variant="h6">Изменение пароля</Typography>
                    </Box>

                    <TextField
                      fullWidth
                      label="Текущий пароль"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                              {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Divider />

                    <TextField
                      fullWidth
                      label="Новый пароль"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      error={!!newPasswordError}
                      helperText={newPasswordError || 'Минимум 8 символов'}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                              {showNewPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Подтверждение нового пароля"
                      type="password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      error={!!confirmPasswordError}
                      helperText={confirmPasswordError}
                    />

                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleChangePassword}
                      disabled={!currentPassword || !newPassword || !confirmPassword || !!newPasswordError || !!confirmPasswordError}
                      sx={{ mt: 1, borderRadius: 2 }}
                    >
                      Обновить пароль
                    </Button>
                  </Stack>
                </Card>
              </Box>
            )}

            {activeTab === 'settings' && (
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
                  Настройки
                </Typography>

                <Card sx={{ p: 3, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }} elevation={0}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">Тема оформления</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Выберите между светлой и темной темой
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LightModeSharpIcon color={mode === 'light' ? 'primary' : 'disabled'} />
                      <Switch
                        checked={mode === 'dark'}
                        onChange={toggleTheme}
                        color="primary"
                      />
                      <DarkModeSharpIcon color={mode === 'dark' ? 'primary' : 'disabled'} />
                    </Box>
                  </Box>
                </Card>
              </Box>
            )}

            {activeTab === 'favorites' && (
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
                  Избранное
                </Typography>
                {status === 'loading' && <CircularProgress />}
                {status === 'succeeded' && favorites?.length === 0 && (
                  <Typography>У вас пока нет избранных парковок</Typography>
                )}
                {status === 'succeeded' && favorites?.length > 0 && (
                  <Grid container spacing={3} sx={{ justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                    {favorites.map((favorite) => (
                      <Grid item xs={12} sm={6} lg={4} key={favorite.id}>
                        <Card
                          sx={{
                            position: 'relative',
                            height: '100%',
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 10px 20px rgba(0,0,0,0.4)' : '0 10px 20px rgba(0,0,0,0.05)',
                              borderColor: 'primary.main'
                            }
                          }}
                        >
                          <CardActionArea
                            onClick={() => handleParkingClick(favorite)}
                            sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                          >
                            <CardMedia
                              component='img'
                              height='160'
                              image={
                                favorite.img
                                  ? `${import.meta.env.VITE_API_URL}/img/parking/${favorite.img}`
                                  : 'parking-default.jpg'
                              }
                              alt={favorite.name}
                              sx={{ bgcolor: 'grey.200' }}
                            />
                            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                              <Typography variant="h6" fontWeight={800} gutterBottom noWrap>
                                {favorite.name}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ color: 'text.secondary', mb: 2, minHeight: 40 }}>
                                <LocationOnIcon sx={{ fontSize: 18, mt: 0.3, color: 'primary.main' }} />
                                <Typography variant='body2' sx={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  {favorite.location?.address}
                                </Typography>
                              </Stack>

                              <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Rating
                                    value={Number(favorite.average_rating) || 0}
                                    readOnly
                                    size='small'
                                    precision={0.5}
                                  />
                                  <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.7 }}>
                                    {Number(favorite.average_rating || 0).toFixed(1)}
                                  </Typography>
                                </Box>
                                <Typography variant='subtitle2' fontWeight={800} color="primary.main">
                                  {favorite.price_per_hour} ₽/ч
                                </Typography>
                              </Box>
                            </CardContent>
                          </CardActionArea>
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              color: 'error.main',
                              bgcolor: 'background.paper',
                              boxShadow: 2,
                              '&:hover': {
                                bgcolor: 'error.main',
                                color: 'white',
                              },
                              zIndex: 2
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromFavorites(favorite.id);
                            }}
                            size="small"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}

            {activeTab === 'bookings' && (
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
                  Бронирования
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
                            <Box
                              display="flex"
                              flexDirection={{ xs: 'column', sm: 'row' }}
                              justifyContent="space-between"
                              alignItems={{ xs: 'flex-start', sm: 'center' }}
                              mb={2}
                              gap={{ xs: 2, sm: 0 }}
                            >
                              <Typography variant='h6'>
                                {booking.ParkingSpace?.ParkingLot?.name || 'Неизвестно'}
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
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
                                  bgcolor: theme.palette.mode === 'dark' ? "grey.800" : "grey.100",
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
                                  bgcolor: theme.palette.mode === 'dark' ? "grey.800" : "grey.100",
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
                                        {new Date(booking.start_time || booking.entry_time).toLocaleString('ru-RU', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                        })}
                                        {' '}в{' '}
                                        {new Date(booking.start_time || booking.entry_time).toLocaleString('ru-RU', {
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
                                        {new Date(booking.end_time || booking.exit_time).toLocaleString('ru-RU', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                        })}
                                        {' '}в{' '}
                                        {new Date(booking.end_time || booking.exit_time).toLocaleString('ru-RU', {
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
                            <Box
                              display="flex"
                              flexDirection={{ xs: 'column', sm: 'row' }}
                              justifyContent="space-between"
                              alignItems={{ xs: 'flex-start', sm: 'center' }}
                              mb={2}
                              gap={{ xs: 2, sm: 0 }}
                            >
                              <Typography variant='h6'>
                                {booking.ParkingSpace?.ParkingLot?.name || 'Неизвестно'}
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
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
                                  bgcolor: theme.palette.mode === 'dark' ? "grey.800" : "grey.100",
                                  p: 2,
                                  borderRadius: 1,
                                  boxShadow: (theme) => theme.palette.mode === 'dark' ? 'none' : 1,
                                  height: '100%'
                                }}>
                                  <Typography variant="subtitle2" color="text.secondary" gutterBottom >
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
                                  bgcolor: theme.palette.mode === 'dark' ? "grey.800" : "grey.100",
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
                                        {new Date(booking.start_time || booking.entry_time).toLocaleString('ru-RU', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                        })}
                                        {' '}в{' '}
                                        {new Date(booking.start_time || booking.entry_time).toLocaleString('ru-RU', {
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
                                        {new Date(booking.end_time || booking.exit_time).toLocaleString('ru-RU', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                        })}
                                        {' '}в{' '}
                                        {new Date(booking.end_time || booking.exit_time).toLocaleString('ru-RU', {
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
                )
                }
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {
        showParkingModal && selectedBooking?.ParkingSpace?.ParkingLot && (
          <Dialog
            open={showParkingModal}
            onClose={() => setShowParkingModal(false)}
            maxWidth={false}
            PaperProps={{
              sx: {
                width: (_theme) => ({
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
        )
      }


    </Container >
  );
}
