import { Typography, Container, Box, IconButton } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';

function Footer() {
  return (
    <Box
      component="footer"
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      sx={{
        width: "100%",
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.primary.main,
        color: (theme) => (theme.palette.mode === "dark" ? "#fff" : "#fff"),
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <Container maxWidth="lg">
        <Box
          display="flex"
          flexDirection= "row" 
          justifyContent="center"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          sx={{ py: 2 }}
        >
          <Box
            display="flex"
            flexDirection= "row" 
            alignItems="center"
            gap={1}
          >
            <IconButton
              component="a"
              href="https://t.me/pashafistov"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "white" }}
            >
              <TelegramIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://github.com/pavelkulak"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "white" }}
            >
              <GitHubIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://vercel.com/pavelkulaks-projects/visit"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "white" }}
            >
              <LanguageIcon />
            </IconButton>
            <Typography variant="body2">
              Павел Кулаков
            </Typography>            
          </Box>
        </Box>
      </Container>      
              
    </Box>
  );
}

export default Footer;