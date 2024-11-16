import { Box, TextField, Stack, Button } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

interface TimeSelectorProps {
  selectedDate: Date;
  selectedTime: string | null;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  label: string;
}

export const TimeSelector = ({ 
  selectedDate, 
  selectedTime, 
  onDateChange, 
  onTimeChange,
  label 
}: TimeSelectorProps) => {
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 21; hour++) {
      for (let minute of ['00', '15', '30', '45']) {
        slots.push(`${hour}:${minute}`);
      }
    }
    return slots;
  };

  return (
    <Box>
      <TextField
        fullWidth
        value={`${label}: ${dayjs(selectedDate).format('DD MMMM')}, ${selectedTime || ''}`}
        variant="outlined"
        size="small"
        sx={{ 
          mb: 1,
          '& .MuiOutlinedInput-root': {
            backgroundColor: label === 'Заезд' ? '#e8f5e9' : '#fff3e0'
          }
        }}
        InputProps={{
          readOnly: true,
        }}
      />
      
      <Stack direction="row" spacing={1}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
          <DateCalendar 
            value={dayjs(selectedDate)}
            onChange={(newDate) => onDateChange(newDate?.toDate() || new Date())}
            sx={{ 
              width: 250,
              '& .MuiPickersDay-root.Mui-selected': {
                backgroundColor: label === 'Заезд' ? '#4caf50' : '#ff9800',
                '&:hover': {
                  backgroundColor: label === 'Заезд' ? '#43a047' : '#f57c00'
                }
              }
            }}
          />
        </LocalizationProvider>

        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          overflowY: 'auto',
          maxHeight: 280,
          width: 80
        }}>
          {generateTimeSlots().map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? 'contained' : 'outlined'}
              onClick={() => onTimeChange(time)}
              size="small"
              sx={{ 
                minWidth: 0,
                py: 0.5,
                backgroundColor: selectedTime === time 
                  ? (label === 'Заезд' ? '#4caf50' : '#ff9800') 
                  : 'transparent',
                color: selectedTime === time ? 'white' : (label === 'Заезд' ? '#4caf50' : '#ff9800'),
                borderColor: label === 'Заезд' ? '#4caf50' : '#ff9800',
                '&:hover': {
                  backgroundColor: selectedTime === time 
                    ? (label === 'Заезд' ? '#43a047' : '#f57c00')
                    : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              {time}
            </Button>
          ))}
        </Box>
      </Stack>
    </Box>
  );
}; 