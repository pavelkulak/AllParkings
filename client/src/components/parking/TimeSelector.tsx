import { Box, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';

interface TimeSelectorProps {
  label: string;
  value: Dayjs | null;
  onChange: (newValue: Dayjs | null) => void;
  minDateTime?: Dayjs;
}

export const TimeSelector = ({
  label,
  value,
  onChange,
  minDateTime
}: TimeSelectorProps) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mb: 1,
          fontWeight: 800,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: 1
        }}
      >
        {label}
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <MobileDateTimePicker
          value={value}
          onChange={onChange}
          minDateTime={minDateTime || dayjs()}
          ampm={false}
          views={['year', 'month', 'day', 'hours']} // Убираем минуты
          format="DD.MM.YYYY HH:00"
          slotProps={{
            textField: {
              fullWidth: true,
              variant: 'outlined',
              sx: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  fontWeight: 600
                }
              }
            },
            actionBar: {
              actions: ['clear', 'cancel', 'accept'],
            }
          }}
        />
      </LocalizationProvider>
    </Box>
  );
};