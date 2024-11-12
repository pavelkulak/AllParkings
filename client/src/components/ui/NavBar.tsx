import { Link } from 'react-router-dom';
import { IUser } from '../../types/auth.types';
import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';

interface NavBarProps {
  user: IUser | null;
  handleSignOut: () => void;
}

export default function NavBar({ user, handleSignOut }: NavBarProps) {
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            Мое приложение
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {user ? (
              <>
                <Typography sx={{ alignSelf: 'center' }}>
                  {user.username}
                </Typography>
                <Button 
                  color="inherit" 
                  onClick={handleSignOut}
                >
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/signin"
                >св
                  Войти
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/signup"
                >
                  Регистрация
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}