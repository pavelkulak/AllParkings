import { Container, Paper } from '@mui/material';
import { GeneralChat } from '../chat/GeneralChat';

export const ChatPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2,
          height: 'calc(100vh - 140px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <GeneralChat />
      </Paper>
    </Container>
  );
}; 