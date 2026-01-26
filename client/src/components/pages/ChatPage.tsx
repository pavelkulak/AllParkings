import { Container, Box } from '@mui/material';
import { GeneralChat } from '../chat/GeneralChat';

export const ChatPage = () => {
  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 2, md: 4 },
        px: { xs: 1, md: 3 },
        display: 'flex',
        justifyContent: 'center',
        minHeight: { xs: 'calc(100vh - 200px)', md: 'auto' },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: '900px' }}>
        <GeneralChat />
      </Box>
    </Container>
  );
}; 