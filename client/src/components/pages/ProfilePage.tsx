import {useAppSelector} from '../../redux/hooks';
import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);

  const fullName = `${user.surname || ''} ${user.name || ''} ${user.patronymic || ''}`.trim();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Box sx={{ display: 'flex', width: '95%', flexDirection: 'column' }}>
        
        <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 3, textAlign: 'center', mb: 2 }}>
          <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 1, bgcolor: 'lightblue' }}>Т</Avatar>
          <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
            сменить аватар
          </Typography>
          
          <Box sx={{ mt: 2, textAlign: 'left' }}>
            <Typography variant="body1"><strong>Номер телефона:</strong>{user.phone}</Typography>
            
            <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <span><strong>Имя:</strong>{fullName}</span>
              <Button variant="text" color="primary" size="small">сменить имя</Button>
            </Typography>
            
            <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <span><strong>Почта:</strong>{user.email}</span>
              <Button variant="text" color="primary" size="small">сменить почту</Button>
            </Typography>
            
            <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <span><strong>Пароль:</strong> ********</span>
              <Button variant="text" color="primary" size="small">сменить пароль</Button>
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2, mt: 2 }}>
          <List>
            {['Избранное', 'История', 'Статистика'].map((text, index) => (
              <ListItem key={index} disableGutters secondaryAction={<AddIcon />}>
                <ListItemText primary={text} primaryTypographyProps={{ fontWeight: 'bold' }} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
}
