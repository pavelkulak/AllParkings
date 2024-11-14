import { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useAppDispatch } from '../../redux/hooks';
import { createBooking } from '../../redux/bookingThunks';
import dayjs from 'dayjs';

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  spaceId: number;
  pricePerHour: number;
  onSuccess: () => void;
}

export const BookingDialog = ({ open, onClose, spaceId, pricePerHour, onSuccess }: BookingDialogProps) => {
  const dispatch = useAppDispatch();
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);
  const [error, setError] = useState<string | null>(null);

  console.log('BookingDialog rendered with spaceId:', spaceId);

  const calculatePrice = () => {
    if (!startTime || !endTime) return 0;
    const hours = endTime.diff(startTime, 'hour', true);
    return Math.max(0, Math.ceil(hours * pricePerHour));
  };

  const handleSubmit = async () => {
    console.log('Attempting to create booking...');
    if (!startTime || !endTime) {
      setError('Пожалуйста, выберите время начала и окончания');
      return;
    }

    if (endTime.isBefore(startTime)) {
      setError('Время окончания должно быть позже времени начала');
      return;
    }

    try {
      await dispatch(createBooking({
        spaceId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      })).unwrap();
      
      console.log('Booking created successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Booking creation failed:', error);
      setError(error.message || 'Ошибка при создании бронирования');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Бронирование места</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && (
            <Typography color="error">{error}</Typography>
          )}
          
          <DateTimePicker
            label="Время начала"
            value={startTime}
            onChange={(newValue) => {
              console.log('Start time changed:', newValue);
              setStartTime(newValue);
            }}
            minDateTime={dayjs()}
            format="DD.MM.YYYY HH:mm"
            ampm={false}
            slotProps={{
              textField: {
                fullWidth: true,
              },
              actionBar: {
                actions: ['clear', 'today', 'accept'],
              },
            }}
          />

          <DateTimePicker
            label="Время окончания"
            value={endTime}
            onChange={(newValue) => {
              console.log('End time changed:', newValue);
              setEndTime(newValue);
            }}
            minDateTime={startTime || dayjs()}
            format="DD.MM.YYYY HH:mm"
            ampm={false}
            slotProps={{
              textField: {
                fullWidth: true,
              },
              actionBar: {
                actions: ['clear', 'today', 'accept'],
              },
            }}
          />

          <Typography variant="h6">
            Стоимость: {calculatePrice()} руб.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained">
          Забронировать
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 