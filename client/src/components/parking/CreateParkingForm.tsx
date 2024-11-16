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
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { LocationButton } from '../map/LocationButton';
import { FileUploader } from '../common/FileUploader';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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
  const userMarkerRef = useRef<any>(null);
  const [mapglAPI, setMapglAPI] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);

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

  const getCurrentPosition = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords: [number, number] = [
              position.coords.longitude,
              position.coords.latitude
            ];
            resolve(coords);
          },
          (error) => {
            console.error('Ошибка получения геолокации:', error);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        reject(new Error('Геолокация недоступна'));
      }
    });
  };

  const createUserMarker = (mapglAPI: any, map: any, coords: [number, number]) => {
    if (userMarkerRef.current) {
      userMarkerRef.current.destroy();
      userMarkerRef.current = null;
    }

    try {
      const marker = new mapglAPI.Marker(map, {
        coordinates: coords,
        label: {
          text: 'Вы здесь',
          offset: [0, -60],
          relativeAnchor: [0.5, 0],
        }
      });
      
      userMarkerRef.current = marker;
      map.setCenter(coords);
      map.setZoom(15);

      return marker;
    } catch (error) {
      console.error('Ошибка при создании маркера:', error);
      return null;
    }
  };

  const initMap = async () => {
    try {
      setIsLoading(true);
      const mapglAPI = await load();
      setMapglAPI(mapglAPI);
      
      if (!mapContainerRef.current) return;

      const userCoords = await getCurrentPosition();
      
      const mapInstance = new mapglAPI.Map(mapContainerRef.current, {
        center: userCoords,
        zoom: 15,
        key: import.meta.env.VITE_2GIS_API_KEY
      });

      // Создаем маркер пользователя
      createUserMarker(mapglAPI, mapInstance, userCoords);

      // Загружаем существующие парковки
      try {
        const response = await fetch('http://localhost:3000/api/parking-lots/all');
        if (!response.ok) {
          throw new Error('Ошибка при загрузке парковок');
        }
        const existingParkings = await response.json();
        
        // Добавляем маркеры существующих парковок
        existingParkings.forEach((parking: Parking) => {
          new mapglAPI.Marker(mapInstance, {
            coordinates: [parking.location.coordinates.lon, parking.location.coordinates.lat],
            label: {
              text: `${parking.price_per_hour}₽/час`,
              offset: [0, -60],
              relativeAnchor: [0.5, 0],
            }
          });
        });
      } catch (error) {
        console.error('Ошибка при загрузке существующих парковок:', error);
      }

      // Создаем маркер для новой парковки
      const parkingMarker = new mapglAPI.Marker(mapInstance, {
        coordinates: userCoords,
        draggable: true,
        label: {
          text: 'Новая парковка',
          offset: [0, -60],
          relativeAnchor: [0.5, 0],
        }
      });

      // Обработчик клика по карте
      mapInstance.on('click', async (e: any) => {
        const coordinates = e.lngLat;
        parkingMarker.setCoordinates(coordinates);

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
          console.error('Ошибка при получении адреса:', error);
        }
      });

      setMap(mapInstance);
      setMarker(parkingMarker);
      setIsLoading(false);
    } catch (error) {
      console.error('Ошибка при инициализации карты:', error);
      setIsLoading(false);
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

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    setParkingData(prev => ({
      ...prev,
      images: newFiles
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!parkingData.name.trim() || !parkingData.location.address.trim() || !parkingData.price_per_hour) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', parkingData.name);
      formData.append('description', parkingData.description);
      formData.append('location', JSON.stringify(parkingData.location));
      formData.append('price_per_hour', parkingData.price_per_hour.toString());
      formData.append('status', parkingData.status);

      if (files.length > 0) {
        formData.append('img', files[0]);
      }

      const result = await dispatch(createParking(formData)).unwrap();
      navigate(`/parking-constructor/${result.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при создании парковки');
      console.error('Error details:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 2, mt: 3, textAlign:'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Создание новой парковки
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {error && <Typography color="error">{error}</Typography>}

            <TextField
              size="small"
              required
              fullWidth
              name="name"
              label="Название парковки"
              value={parkingData.name}
              onChange={handleChange}
              autoFocus
            />

            <TextField
              size="small"
              fullWidth
              multiline
              rows={4}
              name="description"
              label="Описание парковки"
              value={parkingData.description}
              onChange={handleChange}
              helperText="Укажите особенности парковки, режим работы и другую полезную информацию"
            />

            <Box sx={{ mt: 2 }}>
              <FileUploader
                files={files}
                onFilesChange={handleFilesChange}
                maxFiles={5}
                acceptedFileTypes={["image/jpeg", "image/png"]}
                maxFileSize={5 * 1024 * 1024}
              >
                <Box
                  sx={{
                    border: "2px dashed #ccc",
                    borderRadius: 2,
                    p: 3,
                    alignContent: "center",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "rgba(0, 0, 0, 0.04)",
                    },
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <CloudUploadIcon
                    sx={{ fontSize: 36, color: "text.secondary" }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Перетащите фотографии сюда или кликните для выбора
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Поддерживаются JPG, PNG. Максимальный размер файла: 5MB
                  </Typography>
                </Box>
              </FileUploader>

              {files.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                  {files.map((file, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={URL.createObjectURL(file)}
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 1,
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Tabs
              value={addressMethod}
              onChange={(_, value) => setAddressMethod(value)}
              sx={{ mb: 2 }}
            >
              <Tab value="input" label="Ввести адрес" />
              <Tab value="map" label="Выбрать на карте" />
            </Tabs>

            {addressMethod === "map" ? (
              <Box sx={{ position: "relative" }}>
                {isLoading && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      zIndex: 2,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}
                <Box
                  ref={mapContainerRef}
                  sx={{ height: 350, width: "100%", mb: 1 }}
                />
                <LocationButton
                  onLocationFound={(coords) => {
                    if (!map || !mapglAPI) return;
                    createUserMarker(mapglAPI, map, coords);
                  }}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Выбранный адрес"
                  value={parkingData.location.address}
                  disabled
                />
              </Box>
            ) : (
              <Box sx={{ position: "relative" }}>
                <TextField
                  size="small"
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
                      position: "absolute",
                      width: "100%",
                      maxHeight: 200,
                      overflow: "auto",
                      zIndex: 1000,
                      mt: 1,
                    }}
                  >
                    {addressSuggestions.map((suggestion, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 1,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <Typography variant="body2">
                          {suggestion.full_name}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                )}
              </Box>
            )}

            <TextField
              size="small"
              required
              fullWidth
              name="price_per_hour"
              label="Цена за час (руб)"
              type="number"
              value={parkingData.price_per_hour}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />

            <Button type="submit" fullWidth variant="contained" size="large">
              Создать и перейти к настройке мест
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}