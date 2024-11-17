import { Typography, Container, Box, IconButton } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';
import GitHubIcon from '@mui/icons-material/GitHub';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        backgroundColor: "primary.main",
        color: "white",
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <Container 
        maxWidth="lg"
        sx={{
          py: 2,
        }}
      >
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="center"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
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
              sx={{ color: "white", ml: 0 }}
            >
              <GitHubIcon />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1 }}>
              Павел Кулаков
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
              sx={{ color: "white", ml: 0 }}
            >
              <GitHubIcon />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1 }}>
              Никита Коломыльцев
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
              sx={{ color: "white", ml: 0 }}
            >
              <GitHubIcon />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1 }}>
              Тимур Соболев
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body2"
          textAlign="center"
          sx={{ pt: 1 }}
        >
          © Eagles {new Date().getFullYear()} Все права защищены!
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;