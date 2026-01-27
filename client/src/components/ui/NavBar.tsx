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
  Drawer,
  List,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../../img/logo.svg';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapIcon from '@mui/icons-material/Map';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import ChatIcon from '@mui/icons-material/Chat';

interface NavBarProps {
  user: IUser | null;
  handleSignOut: () => void;
}

export default function NavBar({ user, handleSignOut }: NavBarProps) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'Карта парковок', path: '/parkings/map', icon: <MapIcon /> },
    ...(user?.role === 'owner' || user?.role === 'admin'
      ? [{ label: 'Создать парковку', path: '/create-parking', icon: <AddLocationIcon /> }]
      : []),
    { label: 'Чат', path: '/chat', icon: <ChatIcon /> }
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 'bold', color: 'primary.main' }}>
        AllParkings
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.label}
            onClick={() => navigate(item.path)}
            sx={{ borderRadius: 2, mb: 1 }}
          >
            <ListItemIcon color="primary">{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      {!user && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          <Button fullWidth variant="outlined" onClick={() => navigate('/signin')}>Войти</Button>
          <Button fullWidth variant="contained" onClick={() => navigate('/signup')}>Регистрация</Button>
        </Stack>
      )}
    </Box>
  );

  return (
    <AppBar position="static" sx={{
      fontFamily: "Merriweather",
      bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.primary.main
    }}>
      <Toolbar disableGutters>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            fontFamily: "Merriweather",
            flexGrow: { xs: 1, sm: 0 }
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, ml: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <Button
            component={Link}
            to="/"
            sx={{
              padding: "10px 20px",
              borderRadius: "5px",
            }}
          >
            <img
              src={logo}
              alt="Логотип AllParkings"
              style={{
                maxWidth: "50px",
                marginRight: "10px",
                filter: "drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.5))",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: "white",
                textDecoration: "none",
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}
            >
              AllParkings
            </Typography>
          </Button>
        </Box>
        <Stack
          direction="row"
          spacing={{ xs: 1, md: 2 }}
          sx={{
            flexGrow: 1,
            justifyContent: "center",
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          <Button
            color="inherit"
            startIcon={<MapIcon />}
            onClick={() => navigate("/parkings/map")}
            sx={{
              fontSize: { xs: '0.875rem', md: '1rem' },
              '& .MuiButton-startIcon': {
                marginRight: { xs: 0.5, md: 1 },
              }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
              Карта парковок
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
              Карта
            </Box>
          </Button>

          {(user?.role === "owner" || user?.role === "admin") && (
            <Button
              color="inherit"
              startIcon={<AddLocationIcon />}
              onClick={() => navigate("/create-parking")}
              sx={{
                fontSize: { xs: '0.875rem', md: '1rem' },
                '& .MuiButton-startIcon': {
                  marginRight: { xs: 0.5, md: 1 },
                }
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                Создать парковку
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
                Создать
              </Box>
            </Button>
          )}
        </Stack>
        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            display: { xs: "flex", sm: "flex" },
            alignItems: "center",
            padding: "10px 20px",
          }}
        >
          {user ? (
            <>
              <Avatar
                alt={user.name}
                src={
                  user.avatar
                    ? `${import.meta.env.VITE_TARGET}${user.avatar}`
                    : user.name.charAt(0).toUpperCase()
                }
                sx={{
                  mr: 2,
                  border: `1px solid ${theme.palette.grey[500]}`,
                  bgcolor: "lightblue",
                  width: 50,
                  height: 50,
                  cursor: "pointer",
                }}
                onClick={handleMenuOpen}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                sx={{
                  margin: 1.2,
                  '& .MuiMenu-paper': {
                    marginLeft: '-10px'
                  }
                }}
                disableScrollLock
              >
                <MenuItem
                  sx={{
                    cursor: "default",
                    opacity: 1,
                    backgroundColor: "transparent",
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                    "&:active": {
                      backgroundColor: "transparent",
                    },
                    "&:focus": {
                      backgroundColor: "transparent",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "transparent",
                    },
                    "&.Mui-disabled": {
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
                        : user.name.charAt(0).toUpperCase()
                    }
                    sx={{ width: 40, height: 40, mr: 3 }}
                  />
                  <Typography variant="body1">{user.name}</Typography>
                </MenuItem>

                <Box
                  sx={{
                    width: "100%",
                    height: "3px",
                    backgroundColor: "secondary.main",
                    margin: "4px 0",
                  }}
                />

                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleMenuClose}
                >
                  <ListItemIcon>
                    <AccountBoxIcon fontSize="small" />
                  </ListItemIcon>
                  Профиль
                </MenuItem>

                {user.role === "owner" && (
                  <MenuItem
                    component={Link}
                    to="/myparking"
                    onClick={handleMenuClose}
                  >
                    <ListItemIcon>
                      <LocalParkingIcon fontSize="small" />
                    </ListItemIcon>
                    Моя парковка
                  </MenuItem>
                )}

                {user?.role === "admin" && (
                  <>
                    <MenuItem
                      component={Link}
                      to="/admin"
                      onClick={handleMenuClose}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.08)",
                        },
                      }}
                    >
                      <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                      </ListItemIcon>
                      Админ панель
                    </MenuItem>
                  </>
                )}

                <MenuItem onClick={handleSignOut} sx={{ color: "red" }}>
                  <ListItemIcon sx={{ color: "red" }}>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Выход
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/signin"
                sx={{
                  display: { xs: "flex", sm: "flex" },
                  alignItems: "center",
                  padding: { xs: "8px 12px", md: "10px 20px" },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  fontWeight: "Regular 400 Italic",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  "&:active": {
                    backgroundColor: "primary.light",
                  },
                }}
              >
                Войти
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/signup"
                sx={{
                  display: { xs: "flex", sm: "flex" },
                  alignItems: "center",
                  padding: { xs: "8px 12px", md: "10px 20px" },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  fontWeight: "Regular 400 Italic",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  "&:active": {
                    backgroundColor: "primary.light",
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
          onClick={() => navigate("/chat")}
          sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}
        >
          <ChatIcon />
        </IconButton>
      </Toolbar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </AppBar>
  );
}
