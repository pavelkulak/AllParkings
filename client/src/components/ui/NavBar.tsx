import { Link } from 'react-router-dom';
import { IUser } from '../../types/auth.types';
import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import logo from "../../img/logo.svg";

interface NavBarProps {
  user: IUser | null;
  handleSignOut: () => void;
}

export default function NavBar({ user, handleSignOut }: NavBarProps) {
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
              <Typography sx={{ alignSelf: "center" }}>
                {user.username}
              </Typography>
              <Button color="inherit" onClick={handleSignOut}>
                Выйти
              </Button>
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