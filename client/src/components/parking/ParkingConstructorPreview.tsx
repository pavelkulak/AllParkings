import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAppSelector } from '../../redux/hooks';

interface ParkingConstructorPreviewProps {
  parkingId: number;
}

export default function ParkingConstructorPreview({ parkingId }: ParkingConstructorPreviewProps) {
  const parking = useAppSelector(state => 
    state.parking.parkingLots.find(p => p.id === parkingId)
  );

  if (!parking) {
    return (
      <Typography color="error">
        Парковка не найдена
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Информация о парковке
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Название: {parking.name}</Typography>
        <Typography variant="body1">Адрес: {parking.location.address}</Typography>
        <Typography variant="body1">Цена за час: {parking.price_per_hour}₽</Typography>
        <Typography variant="body1">Статус: {parking.status}</Typography>
      </Box>

      <Typography variant="h6" gutterBottom>
        Конфигурация парковочных мест
      </Typography>
      
      {parking.ParkingSpaces && (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: 1 
        }}>
          {parking.ParkingSpaces.map(space => (
            <Box 
              key={space.id}
              sx={{
                border: '1px solid #ccc',
                p: 1,
                textAlign: 'center',
                borderRadius: 1
              }}
            >
              <Typography variant="body2">
                Место #{space.space_number}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}