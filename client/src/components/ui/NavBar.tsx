import { Link } from "react-router-dom";
import { IUser } from "../../types/auth.types";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Avatar,
  ListItemIcon,
  Menu,
  MenuItem,
} from "@mui/material";
import logo from "../../img/logo.svg";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import iconHolder from "../../img/icon-holder.svg";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";



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
  return (
    <AppBar position="static" sx={{ fontFamily: "Merriweather" }}>
      <Toolbar disableGutters>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            fontFamily: "Merriweather",
          }}
        >
          <Button
            component={Link}
            to="/"
            sx={{
              padding: "10px 20px", // Увеличиваем внутренние отступы
              backgroundColor: "primary.main", // Фоновый цвет кнопки
              borderRadius: "5px", // Скругленные углы
            }}
          >
            <img
              src={logo}
              alt="Логотип AllParkings"
              style={{
                maxWidth: "50px",
                marginRight: "10px",
                filter: "drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.5))", // Тень для логотипа
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: "white",
                textDecoration: "none",
                fontWeight: "bold", // Жирный шрифт
                letterSpacing: "0.5px", // Увеличенное расстояние между буквами
              }}
            >
              AllParkings
            </Typography>
          </Button>
        </Box>

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
                    : user?.name.charAt(0).toUpperCase() || undefined
                }
                sx={{
                  mr: 2,
                  border: `1px solid ${theme.palette.grey[500]}`,
                  bgcolor: "lightblue",
                  width: 60,
                  height: 60,
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
              >
                <MenuItem
                  sx={{
                    cursor: "default",
                    opacity: 1,

                    backgroundColor: "transparent", // Устанавливаем фоновый цвет по умолчанию
                    "&:hover": {
                      backgroundColor: "transparent", // Убираем фон при наведении
                    },
                    "&:active": {
                      backgroundColor: "transparent", // Убираем фон при активации
                    },
                    "&:focus": {
                      backgroundColor: "transparent", // Убираем фон при фокусе
                    },
                    "&.Mui-selected": {
                      backgroundColor: "transparent", // Убираем фон для выбранного состояния
                    },
                    "&.Mui-disabled": {
                      opacity: 1, // Устанавливаем непрозрачность для отключенного состояния
                    },
                  }}
                  disableRipple
                >
                  <Avatar
                    alt={user.name}
                    src={
                      user.avatar
                        ? `${import.meta.env.VITE_TARGET}${user.avatar}`
                        : iconHolder
                    }
                    sx={{ width: 40, height: 40, mr: 1 }}
                  />
                  <Typography variant="body1">{user.name}</Typography>
                </MenuItem>

                <Box
                  sx={{
                    width: "100%", // или установите фиксированную ширину
                    height: "3px", // Высота линии
                    backgroundColor: "secondary.main", // Цвет линии
                    margin: "4px 0", // Отступы сверху и снизу
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

                <MenuItem
                  component={Link}
                  to="/settings"
                  onClick={handleMenuClose}
                >
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Настройки
                </MenuItem>

                {user && (
                  <MenuItem onClick={handleSignOut} sx={{ color: "red" }}>
                    <ListItemIcon sx={{ color: "red" }}>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Выход
                  </MenuItem>
                )}
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
                  padding: "10px 20px",
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
                  padding: "10px 20px",
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
      </Toolbar>
    </AppBar>
  );
}
