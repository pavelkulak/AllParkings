import { Typography, Container, Box, IconButton } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import GitHubIcon from '@mui/icons-material/GitHub';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        backgroundColor: "primary.main",
        color: "white",
        padding: 0,
      }}
    >
      <Container maxWidth="lg">
        <Box
          display={{ xs: "block", sm: "flex" }} // Вертикально на маленьких экранах, горизонтально на больших
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          {/* Первая пара значков */}
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems="center"
            sx={{ mx: 2 }}
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
              sx={{ color: "white", ml: 1 }}
            >
              <GitHubIcon />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1 }}>
              pashafistov
            </Typography>
          </Box>

          {/* Вторая пара значков */}
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems="center"
            sx={{ mx: 2 }}
          >
            <IconButton
              component="a"
              href="https://t.me/Nikitushka_05"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "white" }}
            >
              <TelegramIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://github.com/Gadyuka0514"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "white", ml: 1 }}
            >
              <GitHubIcon />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1 }}>
              Nikitushka_05
            </Typography>
          </Box>

          {/* Третья пара значков */}
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            alignItems="center"
            sx={{ mx: 2 }}
          >
            <IconButton
              component="a"
              href="https://t.me/BEAVISE"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "white" }}
            >
              <TelegramIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://github.com/kex121"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "white", ml: 1 }}
            >
              <GitHubIcon />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1 }}>
              BEAVISE
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body2"
          textAlign="center"
          sx={{ p: 2, mt: "auto" }}
        >
          © {new Date().getFullYear()} Все права защищены!
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;