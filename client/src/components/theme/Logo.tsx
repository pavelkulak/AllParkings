import { Box, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

export const Logo = () => {
  const theme = useTheme();

  return (
    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          component="img"
          src="/logo.svg"
          sx={{
            width: 40,
            height: 40,
            filter: theme.palette.mode === 'dark' ? 'brightness(0.8)' : 'none'
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: theme.palette.mode === 'dark' ? '#fff' : 'inherit'
          }}
        >
          ALLPARKINGS
        </Typography>
      </Box>
    </Link>
  );
};