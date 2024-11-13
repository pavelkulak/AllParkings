import { useState, useEffect, useRef } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

interface LocationButtonProps {
  onLocationFound: (coords: [number, number]) => void;
}

export const LocationButton = ({ onLocationFound }: LocationButtonProps) => {
  const [loading, setLoading] = useState(false);
  
  const watchId = useRef<number | null>(null);
  const locationMarkerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const handleClick = () => {
    setLoading(true);
    console.log('LocationButton: Начало запроса геолокации');
    
    if ('geolocation' in navigator) {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude
          ];
          console.log('LocationButton: Получены координаты:', {
            raw: position.coords,
            formatted: coords
          });
          onLocationFound(coords);
          setLoading(false);
        },
        (error) => {
          console.error('LocationButton: Ошибка геолокации:', {
            code: error.code,
            message: error.message
          });
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  return (
    <Tooltip title="Моё местоположение">
      <IconButton 
        onClick={handleClick}
        disabled={loading}
        sx={{
          position: 'absolute',
          right: 10,
          bottom: 120,
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'background.default' },
          zIndex: 1
        }}
      >
        <MyLocationIcon />
      </IconButton>
    </Tooltip>
  );
};
