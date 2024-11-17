import { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useAppDispatch } from '../../redux/hooks';
import { createBooking } from '../../redux/bookingThunks';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

// Обновляем интерфейс BookingDialog
interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  spaceId: number;
  pricePerHour: number;
  onSuccess: () => void;
  entryTime: Date;
  exitTime: Date;
}

export const BookingDialog = ({
  open,
  onClose,
  spaceId,
  pricePerHour,
  onSuccess,
  entryTime,
  exitTime
}: BookingDialogProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  const calculatePrice = () => {
    const hours = dayjs(exitTime).diff(dayjs(entryTime), 'hour', true);
    return Math.max(0, Math.ceil(hours * pricePerHour));
  };

  const handleSubmit = async () => {
    try {
      const result = await dispatch(createBooking({
        spaceId,
        startTime: dayjs(entryTime).toISOString(),
        endTime: dayjs(exitTime).toISOString()
      })).unwrap();
      
      if (result) {
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка при создании бронирования');
      onSuccess();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth 
      fullScreen={isMobile}
    >
      <DialogTitle>Подтверждение бронирования</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && (
            <Typography color="error">{error}</Typography>
          )}
          
          <Box>
            <Typography variant="subtitle2" gutterBottom>Время бронирования:</Typography>
            <Typography>
              С {dayjs(entryTime).format('DD.MM.YYYY HH:mm')} до {dayjs(exitTime).format('DD.MM.YYYY HH:mm')}
            </Typography>
          </Box>

          <Typography variant="h6">
            Стоимость: {calculatePrice()} руб.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Отмена</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
        >
          Подтвердить бронирование
        </Button>
      </DialogActions>
    </Dialog>
  );
};