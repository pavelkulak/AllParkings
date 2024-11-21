import { Box, TextField, Stack, Button, useTheme } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrBefore);

interface TimeSelectorProps {
  selectedDate: Date;
  selectedTime: string | null;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  label: string;
  entryDate?: Date | null;
  entryTime?: string | null;
}

export const TimeSelector = ({ 
  selectedDate, 
  selectedTime, 
  onDateChange, 
  onTimeChange,
  label,
  entryDate,
  entryTime 
}: TimeSelectorProps) => {
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour <= 23; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      slots.push(`${formattedHour}:00`);
    }
    return slots;
  };

  const theme = useTheme();

  const now = dayjs();

  const isTimeDisabled = (time: string) => {
    if (label === 'Заезд') {
      const currentHour = now.hour();
      const selectedHour = parseInt(time.split(':')[0]);
      return dayjs(selectedDate).isSame(now, 'day') && selectedHour < currentHour;
    } else if (entryDate && entryTime) {
      const entryDateTime = dayjs(entryDate)
        .hour(parseInt(entryTime.split(':')[0]))
        .minute(0);
      
      const currentDateTime = dayjs(selectedDate)
        .hour(parseInt(time.split(':')[0]))
        .minute(0);
      
      return currentDateTime.isSameOrBefore(entryDateTime);
    }
    return false;
  };

  return (
    <Box>
      <TextField
        fullWidth
        value={`${label}: ${dayjs(selectedDate)
          .locale("ru")
          .format("DD MMMM")
          .toLowerCase()}, ${selectedTime || ""}`}
        variant="outlined"
        size="small"
        sx={{
          mb: 1,
          bgcolor: theme.palette.mode === "dark" ? "grey.600" : "white",
          // '& .MuiOutlinedInput-root': {
          //   backgroundColor: label === 'Заезд' ? '#e8f5e9' : '#fff3e0'
          // }
        }}
        InputProps={{
          readOnly: true,
        }}
      />

      <Stack direction="row" spacing={1} sx={{ height: "280px" }}>
        <Box
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            p: 0.5,
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
            <DateCalendar
              value={dayjs(selectedDate)}
              onChange={(newDate) =>
                onDateChange(newDate?.toDate() || new Date())
              }
              minDate={now}
              sx={{
                bgcolor: theme.palette.mode === "dark" ? "grey.800" : "white",
                width: 250,
                "& .MuiPickersDay-root": {
                  borderRadius: "50%",
                },
                "& .MuiPickersDay-root.Mui-selected": {
                  backgroundColor: label === "Заезд" ? "#4caf50" : "#ff9800",
                  borderRadius: "50%",
                  "&:hover": {
                    backgroundColor: label === "Заезд" ? "#43a047" : "#f57c00",
                  },
                },
                "& .MuiDayCalendar-header": {
                  paddingBottom: "4px",
                },
                "& .MuiPickersCalendarHeader-root": {
                  paddingBottom: "4px",
                  marginTop: 0,
                },
                "& .MuiDayCalendar-monthContainer": {
                  marginTop: "4px",
                },
                "& .MuiPickersCalendarHeader-root + .MuiDayCalendar-header": {
                  marginTop: 0,
                },
              }}
            />
          </LocalizationProvider>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            overflowY: "auto",
            height: "100%",
            width: 90,
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            p: 0.5,
          }}
        >
          {generateTimeSlots().map((time) => {
            const isDisabled = isTimeDisabled(time);

            return (
              <Button
                key={time}
                variant={selectedTime === time ? "contained" : "outlined"}
                onClick={() => !isDisabled && onTimeChange(time)}
                disabled={isDisabled}
                size="small"
                sx={{
                  minWidth: 0,
                  py: 0.5,
                  backgroundColor:
                    selectedTime === time
                      ? label === "Заезд"
                        ? "#4caf50"
                        : "#ff9800"
                      : "transparent",
                  color:
                    selectedTime === time
                      ? "white"
                      : label === "Заезд"
                      ? "#4caf50"
                      : "#ff9800",
                  borderColor: label === "Заезд" ? "#4caf50" : "#ff9800",
                  "&:hover": {
                    backgroundColor:
                      selectedTime === time
                        ? label === "Заезд"
                          ? "#43a047"
                          : "#f57c00"
                        : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                {time}
              </Button>
            );
          })}
        </Box>
      </Stack>
    </Box>
  );
}; 