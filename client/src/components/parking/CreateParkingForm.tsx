import { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../redux/hooks';
import { createParking } from '../../redux/parkingThunks';
import { useNavigate } from 'react-router-dom';
import { load } from '@2gis/mapgl';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Stack,
  Paper,
  FormControlLabel,
  Switch,
  Tabs,
  Tab
} from '@mui/material';

export default function CreateParkingForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [addressMethod, setAddressMethod] = useState<'input' | 'map'>('input');
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);

  const [parkingData, setParkingData] = useState({
    name: '',
    description: '',
    location: {
      address: '',
      coordinates: {
        lat: null,
        lon: null
      }
    },
    price_per_hour: '',
    status: 'pending' as const
  });

  const [addressSuggestions, setAddressSuggestions] = useState<Array<{
    name: string;
    full_name: string;
    coordinates: [number, number];
  }>>([]);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (addressMethod === 'map' && !map) {
      initMap();
    }
    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, [addressMethod]);

  const initMap = async () => {
    try {
      const mapglAPI = await load();
      const defaultCenter = [82.920430, 55.030199];
      
      if (!mapContainerRef.current) return;

      // Загружаем существующие парковки
      const response = await fetch('http://localhost:3000/api/parking-lots/all');
      if (!response.ok) {
        throw new Error('Ошибка при загрузке парковок');
      }
      const existingParkings = await response.json();
      
      const mapInstance = new mapglAPI.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        key: import.meta.env.VITE_2GIS_API_KEY
      });

      // Добавляем маркеры существующих парковок
      existingParkings.forEach((parking: Parking) => {
        new mapglAPI.Marker(mapInstance, {
          coordinates: [parking.location.coordinates.lon, parking.location.coordinates.lat],
          label: {
            text: `${parking.price_per_hour} руб/час`,
            offset: [0, -60],
            relativeAnchor: [0.5, 0],
          },
          icon: {
            color: '#808080', // Серый цвет для существующих парковок
          }
        });
      });

      // Маркер для новой парковки
      const markerInstance = new mapglAPI.Marker(mapInstance, {
        coordinates: defaultCenter,
        draggable: true,
        icon: {
          color: '#1976d2', // Синий цвет для нового маркера
        }
      });

      mapInstance.on('click', async (e: any) => {
        const coordinates = e.lngLat;
        markerInstance.setCoordinates(coordinates);

        try {
          const response = await fetch(
            `https://catalog.api.2gis.com/3.0/items/geocode?lat=${coordinates[1]}&lon=${coordinates[0]}&key=${import.meta.env.VITE_2GIS_API_KEY}`
          );
          const data = await response.json();
          const address = data.result.items[0]?.full_name || 'Адрес не найден';
          
          setParkingData(prev => ({
            ...prev,
            location: {
              address,
              coordinates: { 
                lat: coordinates[1], 
                lon: coordinates[0] 
              }
            }
          }));
        } catch (error) {
          console.error('Оибка при получении адреса:', error);
        }
      });

      setMap(mapInstance);
      setMarker(markerInstance);
    } catch (error) {
      console.error('Ошибка при инициализации карты:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParkingData(prev => ({
      ...prev,
      ...(name === 'address' 
        ? { location: { ...prev.location, address: value } }
        : { [name]: value })
    }));
  };

  const handleAddressInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    console.log('Input value:', value);
    handleChange(e);

    if (value.length < 3) {
      console.log('Input too short, clearing suggestions');
      setAddressSuggestions([]);
      return;
    }

    try {
      // const url = `https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent(value)}&fields=items.point,items.full_name&key=${import.meta.env.VITE_2GIS_API_KEY}`;
      console.log('Fetching suggestions from:', url);

      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (!data.result || !data.result.items) {
        console.log('No items in response');
        return;
      }

      const suggestions = data.result.items
        .filter((item: any) => item.point && item.full_name)
        .map((item: any) => ({
          name: item.name || '',
          full_name: item.full_name,
          coordinates: [item.point.lon, item.point.lat]
        }));
      
      console.log('Processed suggestions:', suggestions);
      setAddressSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSuggestionSelect = (suggestion: typeof addressSuggestions[0]) => {
    console.log('Selected suggestion:', suggestion);
    setParkingData(prev => ({
      ...prev,
      location: {
        address: suggestion.full_name,
        coordinates: {
          lat: suggestion.coordinates[1],
          lon: suggestion.coordinates[0]
        }
      }
    }));
    setAddressSuggestions([]);
    
    if (map && marker) {
      console.log('Moving marker to:', suggestion.coordinates);
      marker.setCoordinates(suggestion.coordinates);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!parkingData.name.trim() || !parkingData.location.address.trim() || !parkingData.price_per_hour) {
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
              fullWidth
              multiline
              rows={4}
              name="description"
              label="Описание парковки"
              value={parkingData.description}
              onChange={handleChange}
              helperText="Укажите особенности парковки, режим работы и другую полезную информацию"
            />

            <Tabs
              value={addressMethod}
              onChange={(_, value) => setAddressMethod(value)}
              sx={{ mb: 2 }}
            >
              <Tab value="input" label="Ввести адрес" />
              <Tab value="map" label="Выбрать на карте" />
            </Tabs>

            {addressMethod === 'map' ? (
              <>
                <Box 
                  ref={mapContainerRef}
                  sx={{ height: 400, width: '100%', mb: 2 }} 
                />
                <TextField
                  fullWidth
                  label="Выбранный адрес"
                  value={parkingData.location.address}
                  disabled
                />
              </>
            ) : (
              <Box sx={{ position: 'relative' }}>
                <TextField
                  required
                  fullWidth
                  name="address"
                  label="Адрес парковки"
                  value={parkingData.location.address}
                  onChange={handleAddressInput}
                  autoComplete="off"
                />
                {addressSuggestions.length > 0 && (
                  <Paper
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      maxHeight: 200,
                      overflow: 'auto',
                      zIndex: 1000,
                      mt: 1
                    }}
                  >
                    {addressSuggestions.map((suggestion, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <Typography variant="body2">{suggestion.full_name}</Typography>
                      </Box>
                    ))}
                  </Paper>
                )}
              </Box>
            )}

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