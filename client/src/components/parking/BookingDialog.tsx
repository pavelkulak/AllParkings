import { useState, useEffect } from 'react';
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
import axiosInstance from '../../services/axiosInstance';

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
  const [existingBookings, setExistingBookings] = useState<any[]>([]);

  useEffect(() => {
    if (open && spaceId) {
      fetchExistingBookings();
    }
  }, [open, spaceId]);

  const fetchExistingBookings = async () => {
    try {
      const response = await axiosInstance.get(`/bookings/space/${spaceId}`);
      setExistingBookings(response.data);
    } catch (error) {
      console.error('Ошибка при получении бронирований:', error);
    }
  };

  const isTimeSlotAvailable = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
    return !existingBookings.some(booking => {
      const bookingStart = dayjs(booking.start_time);
      const bookingEnd = dayjs(booking.end_time);
      return (
        (start.isBefore(bookingEnd) && end.isAfter(bookingStart)) ||
        (start.isSame(bookingStart) || end.isSame(bookingEnd))
      );
    });
  };

  const calculatePrice = () => {
    if (!startTime || !endTime) return 0;
    const hours = endTime.diff(startTime, 'hour', true);
    return Math.max(0, Math.ceil(hours * pricePerHour));
  };

  const handleSubmit = async () => {
    if (!startTime || !endTime) {
      setError('Пожалуйста, выберите время начала и окончания');
      return;
    }

    if (endTime.isBefore(startTime)) {
      setError('Время окончания должно быть позже времени начала');
      return;
    }

    if (!isTimeSlotAvailable(startTime, endTime)) {
      setError('Выбранное время уже занято');
      return;
    }

    try {
      await dispatch(createBooking({
        spaceId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      })).unwrap();
      
      onSuccess();
      onClose();
    } catch (error: any) {
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
            onChange={setStartTime}
            minDateTime={dayjs()}
            format="DD.MM.YYYY HH:mm"
            ampm={false}
            slotProps={{
              textField: { fullWidth: true }
            }}
          />

          <DateTimePicker
            label="Время окончания"
            value={endTime}
            onChange={setEndTime}
            minDateTime={startTime || dayjs()}
            format="DD.MM.YYYY HH:mm"
            ampm={false}
            slotProps={{
              textField: { fullWidth: true }
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