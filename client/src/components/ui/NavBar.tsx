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
  Stack,
  IconButton,
} from '@mui/material';
import logo from '../../img/logo.svg';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapIcon from '@mui/icons-material/Map';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import ChatIcon from '@mui/icons-material/Chat';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { clearUnreadCount } from '../../redux/slices/chatSlice';

interface NavBarProps {
  user: IUser | null;
  handleSignOut: () => void;
}

export default function NavBar({ user, handleSignOut }: NavBarProps) {
  const navigate = useNavigate();
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const unreadCount = useAppSelector((state) => state.chat.unreadCount);
  const dispatch = useAppDispatch();

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
        <Stack
          direction='row'
          spacing={2}
          sx={{
            flexGrow: 1,
            justifyContent: 'center',
          }}
        >
          <Button
            color='inherit'
            startIcon={<MapIcon />}
            onClick={() => navigate('/parkings/map')}
          >
            Карта парковок
          </Button>

          {(user?.role === 'owner' || user?.role === 'admin') && (
            <Button
              color='inherit'
              startIcon={<AddLocationIcon />}
              onClick={() => navigate('/create-parking')}
            >
              Создать парковку
            </Button>
          )}
        </Stack>
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
        <IconButton
          color="inherit"
          onClick={() => navigate('/chat')}
          sx={{ mr: 2 }}
        >
          <ChatIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
