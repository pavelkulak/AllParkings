import { FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { signIn } from '../../redux/thunkActions';
import type { LoginCredentials } from '../../types/auth.types';
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Typography,
  Stack
} from '@mui/material';

export default function SignIn() {
  const dispatch = useAppDispatch();
  const { error, status } = useAppSelector((state) => state.auth);

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
    <Container maxWidth="xs">
      <Box sx={{ 
        mt: 8, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <Typography component="h1" variant="h5">
          Вход в систему
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Stack spacing={2}>
            {error && (
              <Typography color="error">
                {error}
              </Typography>
            )}
            <TextField
              required
              fullWidth
              name="email"
              label="Email"
              type="email"
              autoFocus
            />
            <TextField
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={status === 'loading'}
              sx={{ mt: 2 }}
            >
              {status === 'loading' ? 'Загрузка...' : 'Войти'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
} 