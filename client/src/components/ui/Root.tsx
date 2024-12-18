import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { signOut } from '../../redux/thunkActions';

import NavBar from './NavBar';
import Footer from "./Footer";
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';


export default function Root() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      // localStorage.removeItem('themeMode');
      window.location.href = '/signin';
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        paddingBottom: '200px',
      }}
    >
      <NavBar user={user} handleSignOut={handleSignOut} />
      <Box 
        sx={{ 
          flex: 1,
          width: '100%',
        }}
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
