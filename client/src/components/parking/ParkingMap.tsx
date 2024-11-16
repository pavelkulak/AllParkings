import { useEffect, useRef, useMemo, useState } from 'react';
import { load } from '@2gis/mapgl';
import { Directions } from '@2gis/mapgl-directions';
import { Box, Container, Paper, Typography, CircularProgress } from '@mui/material';
import { Parking } from '../../types/parking';
import { LocationButton } from '../map/LocationButton';
import { ParkingModal } from './ParkingModal';

export const ParkingMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const routeRef = useRef<any>(null);
  const directionsRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const [mapglAPI, setMapglAPI] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);

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

  const buildRoute = async (mapglAPI: any, map: any, from: [number, number], to: [number, number]) => {
    try {
      // Удаляем существующий маршрут
      if (routeRef.current) {
        routeRef.current.destroy();
        routeRef.current = null;
      }

      // Удаляем существующий directions
      if (directionsRef.current) {
        directionsRef.current.clear();
      }

      // Создаем новый directions
      directionsRef.current = new Directions(map, {
        directionsApiKey: import.meta.env.VITE_2GIS_API_KEY,
      });

      const routeResponse = await directionsRef.current.carRoute({
        points: [from, to],
      });

      if (routeResponse && routeResponse.geometry) {
        routeRef.current = new mapglAPI.Polyline(map, {
          coordinates: routeResponse.geometry.coordinates,
          width: 5,
          color: '#4285f4',
        });
      }
    } catch (error) {
      console.error('Ошибка построения маршрута:', error);
    }
  };

  // Функция получения местоположения
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

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/parking-lots/all');
        if (!response.ok) {
          throw new Error('Ошибка при згузке парковок');
        }
        const data = await response.json();
        setParkings(data);
      } catch (error) {
        console.error('Ошибка:', error);
      }
    };

    fetchParkings();
  }, []);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        
        console.log('Получаем местоположение...');
        const userCoords = await getCurrentPosition();
        console.log('Получены координаты:', userCoords);

        console.log('Загружаем API карты...');
        const mapglAPI = await load();
        setMapglAPI(mapglAPI);
        console.log('API карты загружен');

        if (!mapContainerRef.current) return;

        const map = new mapglAPI.Map(mapContainerRef.current, {
          center: userCoords,
          zoom: 15,
          key: import.meta.env.VITE_2GIS_API_KEY
        });

        mapInstanceRef.current = map;
        isInitializedRef.current = true;

        // Создаем маркер пользователя
        createUserMarker(mapglAPI, map, userCoords);
        
        // Добавляем маркеры парковок
        parkings.forEach((parking: Parking) => {
          const marker = new mapglAPI.Marker(map, {
            coordinates: [parking.location.coordinates.lon, parking.location.coordinates.lat],
            
          });

          marker.on('click', () => handleMarkerClick(parking));
          markersRef.current.push(marker);
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка при инициализации:', error);
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        if (userMarkerRef.current) {
          userMarkerRef.current.destroy();
        }
        if (routeRef.current) {
          routeRef.current.destroy();
        }
        if (directionsRef.current) {
          directionsRef.current.clear();
        }
        markersRef.current.forEach(marker => marker.destroy());
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [parkings]);

  const handleMarkerClick = (parking: Parking) => {
    setSelectedParking(parking);
  };

  const handleBuildRoute = async (parking: Parking) => {
    try {
      const userCoords = await getCurrentPosition();
      const parkingCoords: [number, number] = [
        parking.location.coordinates.lon,
        parking.location.coordinates.lat
      ];
      
      if (mapglAPI && mapInstanceRef.current) {
        await buildRoute(
          mapglAPI, 
          mapInstanceRef.current, 
          userCoords, 
          parkingCoords
        );
      }
    } catch (error) {
      console.error('Ошибка при построении маршрута:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Карта парковок
        </Typography>
        <Box sx={{ position: 'relative' }}>
          {isLoading && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 2,
            }}>
              <CircularProgress />
            </Box>
          )}
          <LocationButton onLocationFound={(coords) => {
            if (!mapInstanceRef.current || !mapglAPI) return;
            createUserMarker(mapglAPI, mapInstanceRef.current, coords);
          }} />
          <Box ref={mapContainerRef} sx={{ height: 600, width: '100%' }} />
        </Box>
      </Paper>
      <ParkingModal 
        parking={selectedParking}
        open={!!selectedParking}
        onClose={() => setSelectedParking(null)}
        onBuildRoute={async () => {
          if (selectedParking) {
            await handleBuildRoute(selectedParking);
            setSelectedParking(null);
          }
        }}
      />
    </Container>
  );
};
