import { useState } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { createParking } from '../../redux/parkingThunks';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Stack,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

export default function CreateParkingForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [parkingData, setParkingData] = useState({
    name: '',
    location: '',
    price_per_hour: '',
    status: 'pending' as const
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setParkingData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!parkingData.name.trim() || !parkingData.location.trim() || !parkingData.price_per_hour) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const result = await dispatch(createParking({
        ...parkingData,
        price_per_hour: Number(parkingData.price_per_hour)
      })).unwrap();
      
      navigate(`/parking-constructor/${result.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при создании парковки');
      console.error('Error details:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Создание новой парковки
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {error && (
              <Typography color="error">
                {error}
              </Typography>
            )}
            
            <TextField
              required
              fullWidth
              name="name"
              label="Название парковки"
              value={parkingData.name}
              onChange={handleChange}
              autoFocus
            />

            <TextField
              required
              fullWidth
              name="location"
              label="Адрес парковки"
              value={parkingData.location}
              onChange={handleChange}
            />

            <TextField
              required
              fullWidth
              name="price_per_hour"
              label="Цена за час (руб)"
              type="number"
              value={parkingData.price_per_hour}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
            >
              Создать и перейти к настройке мест
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}