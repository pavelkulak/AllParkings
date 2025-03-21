import React, { useEffect, useState } from 'react';
import { Box, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useAppSelector } from '../../redux/hooks';
import { UserParkingScheme } from './UserParkingScheme';
import { ParkingEntrance } from '../../types/parking.types';

interface ParkingConstructorPreviewProps {
  parkingId: number;
}

export default function ParkingConstructorPreview({ parkingId }: ParkingConstructorPreviewProps) {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [entrance, setEntrance] = useState<ParkingEntrance | null>(null);
  const [loading, setLoading] = useState(true);
  
  const parking = useAppSelector(state => 
    state.admin.pendingParkings.find(p => p.id === parkingId)
  );

  useEffect(() => {
    const fetchParkingSpaces = async () => {
      try {
        console.log('Fetching spaces for parking:', parkingId);
        const response = await fetch(`http://localhost:3000/api/parking-lots/${parkingId}/spaces`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          throw new Error('Failed to fetch spaces');
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        
        setSpaces(data.ParkingSpaces || []);
        setEntrance(data.ParkingEntrance || null);
      } catch (error) {
        console.error('Error fetching spaces:', error);
      } finally {
        setLoading(false);
      }
    };

    if (parkingId) {
      fetchParkingSpaces();
    }
  }, [parkingId]);

  if (!parking) {
    return (
      <Typography color="error">
        Парковка не найдена
      </Typography>
    );
  }


  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "На рассмотрении",
          color: "warning" as const,
        };
      case "active":
        return {
          label: "Активна",
          color: "success" as const,
        };
      case "inactive":
        return {
          label: "Неактивна",
          color: "error" as const,
        };
      default:
        return {
          label: "Статус неизвестен",
          color: "default" as const,
        };
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Информация о парковке
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Название: {parking.name}</Typography>
        <Typography variant="body1">
          Адрес: {parking.location.address}
        </Typography>
        <Typography variant="body1">
          Цена за час: {parking.price_per_hour}₽
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body1">Статус:</Typography>
          <Chip
            label={getStatusInfo(parking.status).label}
            color={getStatusInfo(parking.status).color}
            size="small"
          />
        </Stack>        
      </Box>

      {parking.img && (
        <Box
          component="img"
          src={`http://localhost:3000/api/img/parking/${parking.img}`}
          alt={parking.name}
          sx={{
            width: "100%",
            height: 200,
            objectFit: "cover",
            borderRadius: 1,
            mb: 2,
          }}
        />
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <UserParkingScheme
          parkingId={parkingId}
          spaces={spaces}
          entrance={entrance}
          userSpaceId={null}
        />
      )}
    </Box>
  );
}