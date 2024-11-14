import { Link } from 'react-router-dom';
import { IUser } from '../../types/auth.types';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  ListItemIcon,
  Menu,
  MenuItem,
  Modal,
  FormControlLabel,
  IconButton,
  Checkbox,
} from '@mui/material';
import logo from '../../img/logo.svg';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import LightModeSharpIcon from '@mui/icons-material/LightModeSharp';
import DarkModeSharpIcon from '@mui/icons-material/DarkModeSharp';
import { Switch } from '@mui/material';

interface NavBarProps {
  user: IUser | null;
  handleSignOut: () => void;
}

export default function NavBar({ user, handleSignOut }: NavBarProps) {
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsOpen = () => {
    setIsSettingsOpen(true);
    handleMenuClose();
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  return (
    <AppBar position='static' sx={{ fontFamily: 'Merriweather' }}>
      <Toolbar disableGutters>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'Merriweather',
          }}
        >
          <Button
            component={Link}
            to='/'
            sx={{
              padding: '10px 20px',
              backgroundColor: 'primary.main',
              borderRadius: '5px',
            }}
          >
            <img
              src={logo}
              alt='Логотип AllParkings'
              style={{
                maxWidth: '50px',
                marginRight: '10px',
                filter: 'drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.5))',
              }}
            />
            <Typography
              variant='h6'
              sx={{
                color: 'white',
                textDecoration: 'none',
                fontWeight: 'bold',
                letterSpacing: '0.5px',
              }}
            >
              AllParkings
            </Typography>
          </Button>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            display: { xs: 'flex', sm: 'flex' },
            alignItems: 'center',
            padding: '10px 20px',
          }}
        >
          {user ? (
            <>
              <Avatar
                alt={user.name}
                src={
                  user.avatar
                    ? `${import.meta.env.VITE_TARGET}${user.avatar}`
                    : user?.name.charAt(0).toUpperCase() || undefined
                }
                sx={{
                  mr: 2,
                  border: `1px solid ${theme.palette.grey[500]}`,
                  bgcolor: 'lightblue',
                  width: 50,
                  height: 50,
                  cursor: 'pointer',
                }}
                onClick={handleMenuOpen}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                sx={{ margin: 1.2 }}
              >
                <MenuItem
                  sx={{
                    cursor: 'default',
                    opacity: 1,
                    backgroundColor: 'transparent',
                    '&:hover': {
                      backgroundColor: 'transparent',
                    },
                    '&:active': {
                      backgroundColor: 'transparent',
                    },
                    '&:focus': {
                      backgroundColor: 'transparent',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'transparent',
                    },
                    '&.Mui-disabled': {
                      opacity: 1,
                    },
                  }}
                  disableRipple
                >
                  <Avatar
                    alt={user.name}
                    src={
                      user.avatar
                        ? `${import.meta.env.VITE_TARGET}${user.avatar}`
                        : user?.name.charAt(0).toUpperCase() || undefined
                    }
                    sx={{ width: 40, height: 40, mr: 3 }}
                  />
                  <Typography variant='body1'>{user.name}</Typography>
                </MenuItem>

                <Box
                  sx={{
                    width: '100%',
                    height: '3px',
                    backgroundColor: 'secondary.main',
                    margin: '4px 0',
                  }}
                />

                <MenuItem
                  component={Link}
                  to='/profile'
                  onClick={handleMenuClose}
                >
                  <ListItemIcon>
                    <AccountBoxIcon fontSize='small' />
                  </ListItemIcon>
                  Профиль
                </MenuItem>

                {user.role === 'owner' && (
                  <MenuItem
                    component={Link}
                    to='/myparking'
                    onClick={handleMenuClose}
                  >
                    <ListItemIcon>
                      <LocalParkingIcon fontSize='small' />
                    </ListItemIcon>
                    Моя парковка
                  </MenuItem>
                )}

                <MenuItem onClick={handleSettingsOpen}>
                  <ListItemIcon>
                    <SettingsIcon fontSize='small' />
                  </ListItemIcon>
                  Настройки
                </MenuItem>

                {user && (
                  <MenuItem onClick={handleSignOut} sx={{ color: 'red' }}>
                    <ListItemIcon sx={{ color: 'red' }}>
                      <LogoutIcon fontSize='small' />
                    </ListItemIcon>
                    Выход
                  </MenuItem>
                )}
              </Menu>
            </>
          ) : (
            <>
              <Button
                color='inherit'
                component={Link}
                to='/signin'
                sx={{
                  display: { xs: 'flex', sm: 'flex' },
                  alignItems: 'center',
                  padding: '10px 20px',
                  fontWeight: 'Regular 400 Italic',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '&:active': {
                    backgroundColor: 'primary.light',
                  },
                }}
              >
                Войти
              </Button>
              <Button
                color='inherit'
                component={Link}
                to='/signup'
                sx={{
                  display: { xs: 'flex', sm: 'flex' },
                  alignItems: 'center',
                  padding: '10px 20px',
                  fontWeight: 'Regular 400 Italic',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '&:active': {
                    backgroundColor: 'primary.light',
                  },
                }}
              >
                Регистрация
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
      <Modal
        open={isSettingsOpen}
        onClose={handleSettingsClose}
        aria-labelledby="settings-modal-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '40%',
            height: '70%',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h6">Настройки</Typography>
            <IconButton onClick={handleSettingsClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
              <LightModeSharpIcon />
              <Typography variant="body2">Light</Typography>
              <Switch />
              <DarkModeSharpIcon />
              <Typography variant="body2">Dark</Typography>
            </Box>

            <FormControlLabel
              control={<Checkbox />}
              label="Скрывать мои комментарии"
            />
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              pt: 2,
              mt: 'auto',
              borderTop: '1px solid #ddd'
            }}
          >
            <Button 
              color="error" 
              sx={{ textTransform: 'none' }}
            >
              Удалить аккаунт
            </Button>
            <Button 
              variant="contained"
              onClick={handleSettingsClose}
              sx={{ minWidth: 100 }}
            >
              Сохранить
            </Button>
          </Box>
        </Box>
      </Modal>
    </AppBar>
  );
}
