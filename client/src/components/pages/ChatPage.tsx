import { Container } from '@mui/material';
import { GeneralChat } from '../chat/GeneralChat';

export const ChatPage = () => {
  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: 4, 
        mb: 4,
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <GeneralChat />
    </Container>
  );
}; 