import { FormEvent, useState } from 'react';
import {
  Typography,
  Container,
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { signIn } from '../../redux/thunkActions';
import type { LoginCredentials } from '../../types/auth.types';
import { VisibilityOff, Visibility } from '@mui/icons-material';
import { Link, useNavigate } from "react-router-dom";

export default function SignIn() {
  const dispatch = useAppDispatch();
  const { error, isLoading } = useAppSelector((state) => state.auth);
  const [showPass, setShowPass] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const credentials: LoginCredentials = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };
    
    await dispatch(signIn(credentials));
  };

  return (
    // <form onSubmit={handleSubmit}>
    //   {error && <div style={{ color: 'red' }}>{error}</div>}
    //   <input type="email" name="email" required placeholder="Email" />
    //   <input type="password" name="password" required placeholder="Password" />
    //   <button type="submit" disabled={isLoading}>
    //     {isLoading ? 'Загрузка...' : 'Войти'}
    //   </button>
    // </form>

    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        width="100%"
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Вход
        </Typography>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            name="email"
            type="email"
            autoComplete="email"
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "secondary.main",
                },
              },
              "& .MuiInputLabel-root": {
                "&.Mui-focused": {
                  color: "secondary.main",
                },
              },
            }}
          />

          <TextField
            label="Пароль"
            variant="outlined"
            fullWidth
            margin="normal"
            name="password"
            type={showPass ? "text" : "password"}
            autoComplete="current-password"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPass((s) => !s)} edge="end">
                    {showPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "secondary.main",
                },
              },
              "& .MuiInputLabel-root": {
                "&.Mui-focused": {
                  color: "secondary.main",
                },
              },
            }}
          />

          <Button
            variant="contained"
            color="secondary"
            type="submit"
            fullWidth
            sx={{ 
              mt: 2,
              color:"white",
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
        </form>

        <Button
          variant="text"
          component={Link}
          to="/signup"
          sx={{ mt: 2, color: "grey.500" }}
        >
          Нет аккаунта? Зарегистрируйтесь
        </Button>
      </Box>
    </Container>
  );
} 