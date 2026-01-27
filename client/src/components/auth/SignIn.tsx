import { FormEvent, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { signIn } from "../../redux/thunkActions";
import type { LoginCredentials } from "../../types/auth.types";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Stack,
  InputAdornment,
  IconButton,
  Paper,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { showNotification } from "../../redux/slices/uiSlice";

export default function SignIn() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, user } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
      return;
    }
    if (status === 'succeeded' && user) {
      dispatch(showNotification({ message: 'Успешный вход!', severity: 'success' }));
    } else if (status === 'failed' && error) {
      dispatch(showNotification({ message: error || 'Ошибка при входе', severity: 'error' }));
    }
  }, [status, error, user, navigate, dispatch]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const credentials: LoginCredentials = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };
    await dispatch(signIn(credentials));
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        py: 4,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, md: 4 },
          width: "100%",
          borderRadius: 3,
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          width="100%"
        >
          <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            Вход
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Войдите в свой аккаунт
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ width: "100%" }}
          >
            <Stack spacing={2.5}>
              <TextField
                required
                fullWidth
                name="email"
                label="Email"
                type="email"
                autoFocus
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
              <TextField
                required
                fullWidth
                name="password"
                label="Пароль"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={status === "loading"}
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                {status === "loading" ? "Загрузка..." : "Войти"}
              </Button>
            </Stack>
          </Box>

          <Button
            variant="text"
            component={Link}
            to="/signup"
            sx={{
              mt: 3,
              color: "text.secondary",
              textTransform: 'none',
            }}
          >
            Нет аккаунта? Зарегистрируйтесь
          </Button>
        </Box>
      </Paper>

    </Container>
  );
}
