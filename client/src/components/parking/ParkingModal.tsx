import { useState, useEffect } from 'react';
import { Dialog, DialogContent, Box, Typography, Button, Rating, Stack, CircularProgress, DialogTitle, IconButton, useTheme } from '@mui/material';
import { Parking } from '../../types/parking';
import { ParkingSpace } from '../../types/parking';
import { ConstructorGrid, GRID_SIZES } from '../constructor/ParkingConstructor';
import { BookingDialog } from './BookingDialog';
import CloseIcon from '@mui/icons-material/Close';
import { Star, StarBorder } from '@mui/icons-material';
import { ReviewList } from '../reviews/ReviewList';
import { ParkingEntrance } from '../../types/parking';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addToFavorites, removeFromFavorites, getFavorites } from '../../redux/favoritesThunks';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { TimeSelector } from './TimeSelector';
import { styled } from '@mui/system';

interface ParkingModalProps {
  parking: Parking | null;
  open: boolean;
  onClose: () => void;
  onBuildRoute?: () => void;
}

const ParkingGrid = styled(Box)`
  border: 1px solid #ccc;
  position: relative;
  background-size: 20px 20px;
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  margin: 20px auto;
  transform-origin: top left;
`;

export const ParkingModal = ({ parking, open, onClose, onBuildRoute }: ParkingModalProps) => {
  const [showSpaces, setShowSpaces] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [entrance, setEntrance] = useState<ParkingEntrance | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [entryTime, setEntryTime] = useState<Date | null>(null);
  const [exitTime, setExitTime] = useState<Date | null>(null);
  const [gridSize, setGridSize] = useState<keyof typeof GRID_SIZES>('medium');
  const [isGridSizeLoaded, setIsGridSizeLoaded] = useState(false);

  const BASE_IMG_URL = 'http://localhost:3000/api/img/parking/';

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { favorites } = useAppSelector((state) => state.favorites);

  const isAuthenticated = !!user;

  console.log('Auth state:', { isAuthenticated });

  const isFavorite = favorites.some(fav => fav.id === parking?.id);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getFavorites());
    }
  }, [dispatch, isAuthenticated]);

  const handleFavoriteClick = async () => {
    if (!isAuthenticated || !parking) return;

    try {
      if (isFavorite) {
        await dispatch(removeFromFavorites(parking.id)).unwrap();
      } else {
        const result = await dispatch(addToFavorites(parking.id)).unwrap();
        if (!result) {
          console.error('Ошибка: Не удалось добавить в избранное');
        }
      }
    } catch (error) {
      console.error('Ошибка при работе с избранным:', error);
    }
  };

  const fetchParkingSpaces = async (parkingId: number) => {
    try {
      setLoading(true);
      setIsGridSizeLoaded(false);
      
      const response = await fetch(`http://localhost:3000/api/parking-lots/${parkingId}/spaces`);
      const data = await response.json();
      
      setGridSize(data.gridSize || 'medium');
      setIsGridSizeLoaded(true);
      
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    setSelectedSpace(null);
    setEntryTime(null);
    setExitTime(null);
    setShowSpaces(false);
    if (parking && entryTime && exitTime) {
      checkAvailableSpaces(parking.id, entryTime, exitTime);
    }
  };

  const handleShowReviews = () => {
    setShowReviews(true);
    setShowSpaces(false);
  };

  const checkAvailableSpaces = async (parkingId: number, entry: Date, exit: Date) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `http://localhost:3000/api/parking-lots/${parkingId}/spaces?` + 
        `entry_time=${entry.toISOString()}&exit_time=${exit.toISOString()}`
      );
      
      const data = await response.json();
      console.log('Полученные данные о местах:', {
        totalSpaces: data.ParkingSpaces?.length,
        freeSpaces: data.ParkingSpaces?.filter(s => s.is_free).length
      });
      
      setSpaces(data.ParkingSpaces || []);
      setEntrance(data.ParkingEntrance || null);
      
    } catch (error) {
      console.error('Ошибка при проверке доступности:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpaceClick = (space: ParkingSpace) => {
    if (!entryTime || !exitTime) {
      return;
    }
    
    console.log('Клик по месту:', {
      spaceId: space.id,
      isFree: space.is_free,
      selectedTime: { entryTime, exitTime }
    });
    
    if (space.is_free) {
      setSelectedSpace(space);
    } else {
      alert('Это место уже забронировано на выбранное время');
    }
  };

  const handleTimeSelect = async (entry: Date | null, exit: Date | null) => {
    if (!parking || !entry || !exit) return;
    
    setEntryTime(entry);
    setExitTime(exit);
    
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/parking-lots/${parking.id}/available-spaces?` + 
        `entry_time=${entry.toISOString()}&exit_time=${exit.toISOString()}`
      );
      
      const data = await response.json();
      setSpaces(data.ParkingSpaces || []);
      setEntrance(data.ParkingEntrance || null);
      setShowSpaces(true);
      
    } catch (error) {
      console.error('Ошибка при проверке доступности:', error);
      setShowSpaces(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parking && open) {
      fetchParkingSpaces(parking.id);
    }
  }, [parking, open]);


  useEffect(() => {
    console.log('ParkingModal - текущий gridSize:', gridSize);
    console.log('ParkingModal - применяемые размеры:', {
      width: GRID_SIZES[gridSize].width,
      height: GRID_SIZES[gridSize].height
    });
  }, [gridSize]);


  if (!parking) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{parking.name}</Typography>
          <Stack direction="row" spacing={1}>
            {isAuthenticated && (
              <IconButton onClick={handleFavoriteClick}>
                {isFavorite ? (
                  <Favorite color="error" />
                ) : (
                  <FavoriteBorder />
                )}
              </IconButton>
            )}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>
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
              bgcolor: 'grey.600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}
          >

            <Typography color="text.secondary">
              изображение осутствует

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
                onClick={() => {
                  if (!isAuthenticated) {
                    window.location.href = '/signin';
                    return;
                  }
                  setShowSpaces(true);
                }}
              >
                {isAuthenticated ? 'Забронировать' : 'Войдите, чтобы забронировать'}
              </Button>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={onBuildRoute}
              >
                Маршрут
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={2} >
            <Button onClick={() => {
              setShowSpaces(false);
              setSpaces([]);
              setSelectedSpace(null);
              setEntryTime(null);
              setExitTime(null);
            }}>
              Назад
            </Button>
            {!entryTime || !exitTime ? (
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}>
                <TimeSelectionSection onTimeSelect={handleTimeSelect} />
              </Box>
            ) : (
              <>
                <Typography variant="h6">
                  Выберите парковочное место
                </Typography>
                <Typography variant="body2">
                  Время: {entryTime.toLocaleString()} - {exitTime.toLocaleString()}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb:0.5}}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      bgcolor: 'rgba(3, 197, 3, 0.2)',
                      border: '2px solid #03c503',
                      borderRadius: 1
                    }} />
                    <Typography variant="body2">Свободн</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1,}}>
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

                {loading || !isGridSizeLoaded ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ 
                    maxWidth: '100%', 
                    maxHeight: '70vh',
                    overflow: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    px: 2,
                    pb: 2
                    
                  }}>
                    <Box sx={{
                      width: '800px',
                      height: '600px',
                      position: 'relative'
                    }}>
                      <ConstructorGrid
                        sx={{
                          width: GRID_SIZES[gridSize].width,
                          height: GRID_SIZES[gridSize].height,
                          transform: `scale(${Math.min(
                            800 / GRID_SIZES[gridSize].width,
                            596 / GRID_SIZES[gridSize].height
                          )})`,
                          transformOrigin: 'top left',
                          bgcolor: 'background.paper'
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
                                handleSpaceClick(space);
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
                    </Box>
                  </Box>
                )}
                {selectedSpace && parking && entryTime && exitTime && (
                  <BookingDialog
                    open={!!selectedSpace}
                    onClose={() => setSelectedSpace(null)}
                    spaceId={selectedSpace.id}
                    pricePerHour={parking.price_per_hour}
                    onSuccess={handleBookingSuccess}
                    entryTime={entryTime}
                    exitTime={exitTime}
                  />
                )}
              </>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface TimeSelectionSectionProps {
  onTimeSelect: (entry: Date | null, exit: Date | null) => void;
}

const TimeSelectionSection = ({ onTimeSelect }: TimeSelectionSectionProps) => {
  const [entry, setEntry] = useState<Date | null>(null);
  const [entryTime, setEntryTime] = useState<string | null>(null);
  const [exit, setExit] = useState<Date | null>(null);
  const [exitTime, setExitTime] = useState<string | null>(null);

  const getDateWithTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':');
    const newDate = new Date(date);
    newDate.setHours(parseInt(hours), parseInt(minutes));
    return newDate;
  };

  const isExitTimeValid = (exitDate: Date, exitTime: string) => {
    if (!entry || !entryTime) return true;
    
    const entryDateTime = getDateWithTime(entry, entryTime);
    const exitDateTime = getDateWithTime(exitDate, exitTime);
    
    return exitDateTime > entryDateTime;
  };

  const handleExitTimeChange = (date: Date) => {
    setExit(date);
    setExitTime(null);
  };

  const handleExitTimeSelect = (time: string) => {
    if (!exit) return;
    
    if (isExitTimeValid(exit, time)) {
      setExitTime(time);
    } else {
      alert('Время выезда должно быть позже времени заезда');
    }
  };

  const theme = useTheme();

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2,
      justifyContent: 'center',
      flexWrap: 'wrap',
    }}>
      <TimeSelector
        label="Заезд"
        selectedDate={entry || new Date()}
        selectedTime={entryTime}
        onDateChange={setEntry}
        onTimeChange={setEntryTime}
      />
      <TimeSelector
        label="Выезд"
        selectedDate={exit || new Date()}
        selectedTime={exitTime}
        onDateChange={handleExitTimeChange}
        onTimeChange={handleExitTimeSelect}
        entryDate={entry}
        entryTime={entryTime}
      />
      <Button
        fullWidth
        variant="contained"
        disabled={!entry || !exit || !entryTime || !exitTime}
        onClick={() => {
          if (entry && exit && entryTime && exitTime) {
            const entryDate = getDateWithTime(entry, entryTime);
            const exitDate = getDateWithTime(exit, exitTime);
            onTimeSelect(entryDate, exitDate);
          }
        }}
      >
        Подтвердить
      </Button>
    </Box>
  );
}; 