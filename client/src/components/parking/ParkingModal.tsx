import { useState, useEffect } from 'react';
import { Dialog, DialogContent, Box, Typography, Button, Rating, Stack, CircularProgress } from '@mui/material';
import { Parking } from '../../types/parking';
import { ParkingSpace } from '../../types/parking';
import { ConstructorGrid } from '../constructor/ParkingConstructor';
import { GRID_SIZES } from '../constructor/ParkingConstructor';
import { BookingDialog } from './BookingDialog';

interface ParkingModalProps {
  parking: Parking | null;
  open: boolean;
  onClose: () => void;
}

export const ParkingModal = ({ parking, open, onClose }: ParkingModalProps) => {
  const [showSpaces, setShowSpaces] = useState(false);
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);

  const fetchParkingSpaces = async (parkingId: number) => {
    try {
      setLoading(true);
      console.log('Fetching spaces for parking:', parkingId);
      const response = await fetch(`http://localhost:3000/api/parking-lots/${parkingId}/spaces`);
      if (!response.ok) throw new Error('Ошибка загрузки мест');
      const data = await response.json();
      console.log('Received parking data:', data);
      console.log('Parking spaces:', data.ParkingSpaces);
      setSpaces(data.ParkingSpaces);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showSpaces && parking) {
      fetchParkingSpaces(parking.id);
    }
  }, [showSpaces, parking]);

  const handleBookingSuccess = () => {
    console.log('Бронирование успешно завершено');
    setSelectedSpace(null);
    if (parking) {
      fetchParkingSpaces(parking.id);
    }
  };

  if (!parking) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth={showSpaces ? "md" : "sm"} 
      fullWidth
    >
      <DialogContent>
        {!showSpaces ? (
          <Stack spacing={2}>
            <Typography variant="h5" component="h2">
              {parking.name}
            </Typography>

            <Box sx={{ 
              width: '100%', 
              height: 200, 
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography color="text.secondary">Фото пока недоступно</Typography>
            </Box>

            <Typography variant="h6" color="primary">
              {parking.price_per_hour} руб/час
            </Typography>

            <Typography variant="body1">
              {parking.description || 'Описание отсутствует'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating value={0} readOnly />
              <Typography variant="body2" color="text.secondary">
                Пока нет отзывов
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                fullWidth
                onClick={() => setShowSpaces(true)}
              >
                Бронь
              </Button>
              <Button variant="outlined" fullWidth>
                Маршрут
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Button onClick={() => setShowSpaces(false)}>
              Назад
            </Button>
            <Typography variant="h6">
              Выберите парковочное место
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  bgcolor: 'rgba(3, 197, 3, 0.2)',
                  border: '2px solid #03c503',
                  borderRadius: 1
                }} />
                <Typography variant="body2">Свободно</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  bgcolor: 'rgba(211, 47, 47, 0.2)',
                  border: '2px solid #d32f2f',
                  borderRadius: 1
                }} />
                <Typography variant="body2">Занято</Typography>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <ConstructorGrid
                sx={{
                  width: GRID_SIZES.medium.width,
                  height: GRID_SIZES.medium.height,
                }}
              >
                {spaces.map((space) => {
                  const location = typeof space.location === 'string' 
                    ? JSON.parse(space.location) 
                    : space.location;
                  
                  if (space.id === spaces[0].id) {
                    const entranceData = typeof space.entrance === 'string' 
                      ? JSON.parse(space.entrance) 
                      : space.entrance;
                    
                    return (
                      <Box
                        key={`entrance-${space.id}`}
                        sx={{
                          position: 'absolute',
                          left: entranceData.x,
                          top: entranceData.y,
                          width: entranceData.width || 40,
                          height: entranceData.height || 40,
                          bgcolor: 'warning.main',
                          border: '1px solid',
                          borderColor: 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                      >
                        <Typography>Вход</Typography>
                      </Box>
                    );
                  }

                  return (
                    <Box
                      key={space.id}
                      sx={{
                        position: 'absolute',
                        left: location.x,
                        top: location.y,
                        width: 40,
                        height: 80,
                        transform: `rotate(${location.rotation}deg)`,
                        bgcolor: space.is_free ? 'rgba(3, 197, 3, 0.2)' : 'rgba(211, 47, 47, 0.2)',
                        border: '2px solid',
                        borderRadius: 4,
                        borderColor: space.is_free ? '#03c503' : '#d32f2f',
                        cursor: space.is_free ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          opacity: space.is_free ? 0.8 : 1
                        }
                      }}
                      onClick={() => {
                        if (space.is_free) {
                          console.log('Selected space for booking:', space);
                          setSelectedSpace(space);
                        }
                      }}
                    >
                      <Typography
                        sx={{
                          color: 'black',
                          fontSize: '0.8rem'
                        }}
                      >
                        {space.space_number}
                      </Typography>
                    </Box>
                  );
                })}
              </ConstructorGrid>
            )}
            {selectedSpace && parking && (
              <BookingDialog
                open={!!selectedSpace}
                onClose={() => setSelectedSpace(null)}
                spaceId={selectedSpace.id}
                pricePerHour={parking.price_per_hour}
                onSuccess={handleBookingSuccess}
              />
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}; 