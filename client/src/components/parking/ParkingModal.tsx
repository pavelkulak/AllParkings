import { useState, useEffect } from 'react';
import { Dialog, DialogContent, Box, Typography, Button, Rating, Stack, CircularProgress, DialogTitle, IconButton } from '@mui/material';
import { Parking } from '../../types/parking';
import { ParkingSpace } from '../../types/parking';
import { ConstructorGrid } from '../constructor/ParkingConstructor';
import { GRID_SIZES } from '../constructor/ParkingConstructor';
import { BookingDialog } from './BookingDialog';
import CloseIcon from '@mui/icons-material/Close';
import { Star, StarBorder } from '@mui/icons-material';
import { ReviewList } from '../reviews/ReviewList';
import { ParkingEntrance } from '../../types/parking';

interface ParkingModalProps {
  parking: Parking | null;
  open: boolean;
  onClose: () => void;
}

export const ParkingModal = ({ parking, open, onClose }: ParkingModalProps) => {
  const [showSpaces, setShowSpaces] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [entrance, setEntrance] = useState<ParkingEntrance | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);

  const BASE_IMG_URL = 'http://localhost:3000/api/img/parking/';

  const fetchParkingSpaces = async (parkingId: number) => {
    console.log('Начало fetchParkingSpaces для parkingId:', parkingId);
    try {
      setLoading(true);
      console.log('Отправка запроса к API...');
      
      const response = await fetch(`http://localhost:3000/api/parking-lots/${parkingId}/spaces`);
      console.log('Получен ответ от сервера:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Ошибка от сервера:', errorData);
        throw new Error('Ошибка загрузки мест');
      }
      
      const data = await response.json();
      console.log('Полученные данные:', JSON.stringify(data, null, 2));
      console.log('ParkingSpaces:', data.ParkingSpaces);
      console.log('ParkingEntrance:', data.ParkingEntrance);
      
      setSpaces(data.ParkingSpaces || []);
      console.log('Установлены места:', data.ParkingSpaces?.length || 0);
      
      setEntrance(data.ParkingEntrance || null);
      console.log('Установлен вход:', data.ParkingEntrance ? 'да' : 'нет');
      
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
      console.log('Загрузка завершена');
    }
  };

  useEffect(() => {
    console.log('useEffect сработал:', { showSpaces, parkingId: parking?.id });
    if (showSpaces && parking) {
      console.log('Начинаем загрузку данных для парковки:', parking.id);
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

  const handleShowReviews = () => {
    setShowReviews(true);
    setShowSpaces(false);
  };

  if (!parking) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {parking.name}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {parking.img ? (
          <Box
            component="img"
            src={`${BASE_IMG_URL}${parking.img}`}
            alt={parking.name}
            sx={{
              width: '100%',
              height: 200,
              objectFit: 'cover',
              borderRadius: 1,
              mb: 2
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: 200,
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}
          >
            <Typography color="text.secondary">
              Изображение отсутствует
            </Typography>
          </Box>
        )}
        {showReviews ? (
          <Stack spacing={2}>
            <Button onClick={() => setShowReviews(false)}>
              Назад
            </Button>
            <ReviewList parkingId={parking.id} />
          </Stack>
        ) : !showSpaces ? (
          <Stack spacing={2}>
            <Typography variant="h5" component="h2">
              {parking.name}
            </Typography>

            <Typography variant="h6" color="primary">
              {parking.price_per_hour} руб/час
            </Typography>

            <Typography variant="body1">
              {parking.description || 'Описание отсутствует'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating 
                value={Number(parking.average_rating) || 0}
                readOnly 
                precision={0.5}
                icon={<Star style={{ color: '#faaf00' }} />}
                emptyIcon={<StarBorder style={{ color: '#faaf00', opacity: 0.55 }} />}
              />
              <Typography variant="body2" color="text.secondary">
                {parking.average_rating ? `${parking.average_rating} из 5` : 'Нет оценок'}
              </Typography>
              <Button 
                variant="text" 
                onClick={handleShowReviews}
                sx={{ ml: 1 }}
              >
                Смотреть отзывы
              </Button>
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
                {entrance && (
                  <Box
                    key="entrance"
                    sx={{
                      position: 'absolute',
                      left: JSON.parse(entrance.location).x,
                      top: JSON.parse(entrance.location).y,
                      width: 40,
                      height: 40,
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
                )}

                {spaces.map((space) => {
                  const location = typeof space.location === 'string' 
                    ? JSON.parse(space.location) 
                    : space.location;

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