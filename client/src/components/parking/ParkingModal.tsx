import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, Box, Typography, Button, Stack, CircularProgress, DialogTitle, IconButton, useTheme, useMediaQuery } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { Parking } from '../../types/parking';
import { ParkingSpace, ParkingEntrance } from '../../types/parking.types';
import { ConstructorGrid, GRID_SIZES } from '../constructor/ParkingConstructor';
import { BookingDialog } from './BookingDialog';
import CloseIcon from '@mui/icons-material/Close';
import { Star } from '@mui/icons-material';
import { ReviewList } from '../reviews/ReviewList';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addToFavorites, removeFromFavorites, getFavorites } from '../../redux/favoritesThunks';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { TimeSelector } from './TimeSelector';
import { showNotification } from '../../redux/slices/uiSlice';
import { updateFavoriteParking } from '../../redux/slices/favoritesSlice';
import axiosInstance from '../../services/axiosInstance';

interface ParkingModalProps {
  parking: Parking | null;
  open: boolean;
  onClose: () => void;
  onBuildRoute?: () => void;
  onParkingUpdate?: (updatedParking: Parking) => void;
}


export const ParkingModal = ({ parking, open, onClose, onBuildRoute, onParkingUpdate }: ParkingModalProps) => {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [localParking, setLocalParking] = useState<Parking | null>(parking);

  useEffect(() => {
    setLocalParking(parking);
  }, [parking]);

  const refreshParkingData = async () => {
    if (!parking) return;
    try {
      const response = await axiosInstance.get<Parking>(`/parking-lots/${parking.id}`);
      const data = response.data;
      setLocalParking(data);
      dispatch(updateFavoriteParking(data));
      if (onParkingUpdate) {
        onParkingUpdate(data);
      }
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error);
    }
  };

  const BASE_IMG_URL = `${import.meta.env.VITE_API_URL}/img/parking/`;

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { favorites } = useAppSelector((state) => state.favorites);

  const isAuthenticated = !!user;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/parking-lots/${parkingId}/spaces`);
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
        `${import.meta.env.VITE_API_URL}/parking-lots/${parkingId}/spaces?` +
        `entry_time=${entry.toISOString()}&exit_time=${exit.toISOString()}`
      );

      const data = await response.json();


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



    if (space.is_free) {
      setSelectedSpace(space);
    } else {
      dispatch(showNotification({ message: 'Это место уже забронировано на выбранное время', severity: 'warning' }));
    }
  };

  const handleTimeSelect = async (entry: Date | null, exit: Date | null) => {
    if (!parking || !entry || !exit) return;

    setEntryTime(entry);
    setExitTime(exit);

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/parking-lots/${parking.id}/available-spaces?` +
        `entry_time=${entry.toISOString()}&exit_time=${exit.toISOString()}`
      );

      const data = await response.json();
      setSpaces(data.ParkingSpaces || []);
      setEntrance(data.ParkingEntrance || null);
      setShowSpaces(true);

    } catch (error) {
      dispatch(showNotification({ message: 'Ошибка при проверке доступности мест', severity: 'error' }));
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
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [showSpaces]);





  if (!parking) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ p: { xs: 2, sm: 3 }, pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
            {localParking?.name || parking?.name}
          </Typography>
          <Stack direction="row" spacing={1}>
            {isAuthenticated && (
              <IconButton
                onClick={handleFavoriteClick}
                sx={{
                  color: isFavorite ? 'error.main' : 'text.secondary',
                  bgcolor: isFavorite ? 'error.soft' : 'transparent',
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': { transform: 'scale(1.1)' },
                  '&:active': { transform: 'scale(0.9)' }
                }}
              >
                {isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            )}
            <IconButton onClick={onClose} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: 3, pt: 0 }}>
        {showReviews ? (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Button
              startIcon={<CloseIcon sx={{ transform: 'rotate(90deg)', fontSize: 18 }} />}
              onClick={() => setShowReviews(false)}
              sx={{ alignSelf: 'flex-start', fontWeight: 600 }}
            >
              Вернуться к описанию
            </Button>
            <ReviewList parkingId={localParking?.id || 0} onReviewAdded={refreshParkingData} />
          </Stack>
        ) : !showSpaces ? (
          <Stack spacing={3}>
            {/* Aspect Ratio Box for Image */}
            <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              {parking.img ? (
                <Box
                  component="img"
                  src={`${BASE_IMG_URL}${parking.img}`}
                  alt={parking.name}
                  sx={{
                    width: '100%',
                    height: { xs: 220, sm: 320 },
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: { xs: 220, sm: 320 },
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}
                >
                  <Typography color="text.secondary" variant="button">Нет фото</Typography>
                </Box>
              )}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(8px)',
                  color: 'white',
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  boxShadow: 2
                }}
              >
                {localParking?.price_per_hour || parking?.price_per_hour} ₽/ч
              </Box>
            </Box>

            <Box>
              <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} mb={1.5}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,165,0,0.1)' : 'rgba(255,165,0,0.05)',
                  color: 'warning.dark',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2
                }}>
                  <Star sx={{ fontSize: 18, color: 'orange' }} />
                  <Typography variant="body2" fontWeight={800}>
                    {localParking?.average_rating || '—'}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={handleShowReviews}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'primary.soft' }
                  }}
                >
                  {(Number(localParking?.average_rating) > 0 || Number(parking?.average_rating) > 0) ? 'Читать все отзывы' : 'Нет отзывов'}
                </Button>
              </Box>

              <Typography variant="body1" sx={{
                color: 'text.secondary',
                lineHeight: 1.7,
                fontSize: '1rem',
                mb: 3
              }}>
                {localParking?.description || parking?.description || 'Удобная современная парковка с круглосуточным доступом. Мы обеспечиваем безопасность вашего автомобиля.'}
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => {
                    if (!isAuthenticated) {
                      window.location.href = '/signin';
                      return;
                    }
                    setShowSpaces(true);
                  }}
                  sx={{
                    borderRadius: 2.5,
                    py: 1.8,
                    fontWeight: 800,
                    boxShadow: (theme) => `0 4px 14px ${theme.palette.primary.main}55`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: (theme) => `0 6px 20px ${theme.palette.primary.main}77`,
                    }
                  }}
                >
                  {isAuthenticated ? 'Забронировать место' : 'Войти и забронировать'}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={onBuildRoute}
                  sx={{
                    borderRadius: 2.5,
                    py: 1.8,
                    fontWeight: 800,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  Построить маршрут
                </Button>
              </Stack>
            </Box>
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Button
                startIcon={<CloseIcon sx={{ transform: 'rotate(90deg)', fontSize: 18 }} />}
                onClick={() => {
                  setShowSpaces(false);
                  setSpaces([]);
                  setSelectedSpace(null);
                  setEntryTime(null);
                  setExitTime(null);
                }}
                sx={{ fontWeight: 600 }}
              >
                Вернуться
              </Button>
              {entryTime && exitTime && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1 }}>
                    Период бронирования
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {entryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {exitTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              )}
            </Box>

            {!entryTime || !exitTime ? (
              <Box sx={{ py: 2 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom textAlign="center" sx={{ mb: 3 }}>
                  На какое время нужна парковка?
                </Typography>
                <TimeSelectionSection onTimeSelect={handleTimeSelect} />
              </Box>
            ) : (
              <>
                <Box>
                  <Typography variant="h6" fontWeight={800} gutterBottom>
                    Выберите место на схеме
                  </Typography>
                  <Stack direction="row" spacing={2} mb={2}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: 0.5 }} />
                      <Typography variant="caption" fontWeight={700} color="text.secondary">Свободно</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', borderRadius: 0.5 }} />
                      <Typography variant="caption" fontWeight={700} color="text.secondary">Занято</Typography>
                    </Stack>
                  </Stack>

                  {loading || !isGridSizeLoaded ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, gap: 2 }}>
                      <CircularProgress size={40} thickness={4} />
                      <Typography variant="body2" color="text.secondary">Загружаем схему...</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ position: 'relative' }}>
                      {isMobile && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            textAlign: 'center',
                            mb: 1,
                            color: 'text.secondary',
                            fontStyle: 'italic'
                          }}
                        >
                          ↔️ Сдвиньте пальцем, чтобы просмотреть всю схему
                        </Typography>
                      )}
                      <Box
                        ref={containerRef}
                        sx={{
                          width: '100%',
                          bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                          borderRadius: 4,
                          p: { xs: 1, sm: 3 },
                          overflow: isMobile ? 'auto' : 'hidden',
                          position: 'relative',
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.05)',
                          '&::-webkit-scrollbar': { height: 6 },
                          '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 }
                        }}
                      >
                        <Box sx={{
                          width: isMobile ? Math.max(containerWidth, 600) : containerWidth,
                          height: (isMobile ? Math.max(containerWidth, 600) : containerWidth) * (GRID_SIZES[gridSize].height / GRID_SIZES[gridSize].width),
                          position: 'relative',
                          mx: 'auto',
                          transition: 'height 0.3s ease-out'
                        }}>
                          <ConstructorGrid
                            sx={{
                              width: GRID_SIZES[gridSize].width,
                              height: GRID_SIZES[gridSize].height,
                              transform: `scale(${(isMobile ? Math.max(containerWidth, 600) : containerWidth) / GRID_SIZES[gridSize].width})`,
                              transformOrigin: 'top left',
                              bgcolor: 'background.paper',
                              margin: '0 !important',
                              top: '0 !important',
                              left: '0 !important',
                              backgroundImage: (theme) => theme.palette.mode === 'dark'
                                ? 'radial-gradient(circle, #333 1px, transparent 1px)'
                                : 'radial-gradient(circle, #eee 1px, transparent 1px)',
                              backgroundSize: '20px 20px',
                              border: 'none',
                              borderRadius: 2,
                              boxShadow: 1
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
                                  border: '3px solid rgba(255,255,255,0.4)',
                                  borderRadius: 1.5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  boxShadow: 3,
                                  zIndex: 2
                                }}
                              >
                                <Typography variant="caption" fontWeight={900} sx={{ fontSize: '0.65rem' }}>ВХОД</Typography>
                              </Box>
                            )}

                            {spaces.map((space) => {
                              const location = typeof space.location === 'string'
                                ? JSON.parse(space.location)
                                : space.location;

                              const isSelected = selectedSpace?.id === space.id;

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
                                    transformOrigin: 'center center',
                                    bgcolor: space.is_free
                                      ? (isSelected ? 'primary.main' : 'rgba(76, 175, 80, 0.15)')
                                      : 'rgba(211, 47, 47, 0.15)',
                                    border: '2px solid',
                                    borderRadius: 1.5,
                                    borderColor: space.is_free
                                      ? (isSelected ? 'primary.dark' : 'success.main')
                                      : 'error.main',
                                    cursor: space.is_free ? 'pointer' : 'not-allowed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    zIndex: isSelected ? 4 : 1,
                                    boxShadow: isSelected ? 6 : 0,
                                    '&:hover': {
                                      bgcolor: space.is_free
                                        ? (isSelected ? 'primary.dark' : 'rgba(76, 175, 80, 0.25)')
                                        : 'rgba(211, 47, 47, 0.15)',
                                      transform: `rotate(${location.rotation}deg) scale(${space.is_free ? 1.08 : 1})`,
                                      boxShadow: space.is_free ? 3 : 0
                                    }
                                  }}
                                  onClick={() => space.is_free && handleSpaceClick(space)}
                                >
                                  <Typography
                                    sx={{
                                      color: isSelected ? 'white' : (theme.palette.mode === 'dark' ? 'white' : 'text.primary'),
                                      fontSize: '0.75rem',
                                      fontWeight: 900,
                                      transform: `rotate(-${location.rotation}deg)`
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
                    </Box>
                  )}
                </Box>
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
  const [entry, setEntry] = useState<Dayjs | null>(null);
  const [exit, setExit] = useState<Dayjs | null>(null);
  const dispatch = useAppDispatch();

  const handleConfirm = () => {
    if (entry && exit) {
      if (exit.isBefore(entry) || exit.isSame(entry)) {
        dispatch(showNotification({
          message: 'Время выезда должно быть позже времени заезда',
          severity: 'error'
        }));
        return;
      }
      onTimeSelect(entry.toDate(), exit.toDate());
    }
  };

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
      <TimeSelector
        label="Заезд"
        value={entry}
        onChange={setEntry}
        minDateTime={dayjs()}
      />
      <TimeSelector
        label="Выезд"
        value={exit}
        onChange={setExit}
        minDateTime={entry || dayjs()}
      />
      <Button
        fullWidth
        variant="contained"
        size="large"
        disabled={!entry || !exit}
        onClick={handleConfirm}
        sx={{
          borderRadius: 3,
          py: 1.5,
          fontWeight: 800,
          boxShadow: (theme) => `0 4px 14px ${theme.palette.primary.main}44`
        }}
      >
        Проверить наличие мест
      </Button>
    </Stack>
  );
};
