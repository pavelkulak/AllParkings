import { Box, Container, Typography, useTheme } from '@mui/material';

export const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.background.footer,
        color: theme.palette.mode === 'dark' ? '#fff' : 'inherit'
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} ALLPARKINGS. Все права защищены.
        </Typography>
      </Container>
    </Box>
  );
};