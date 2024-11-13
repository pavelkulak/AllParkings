import { useEffect, useRef } from 'react';
import { load } from '@2gis/mapgl';
import { Box, Container, Paper, Typography } from '@mui/material';
import { Parking } from '../../types/parking';

export const ParkingMap = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const initMap = async () => {
      try {
        if (isInitializedRef.current || mapInstanceRef.current || !mapContainerRef.current) {
          return;
        }

        isInitializedRef.current = true;

        const response = await fetch('http://localhost:3000/api/parking-lots/all');
        if (!response.ok) {
          throw new Error('Ошибка при загрузке парковок');
        }
        const parkings = await response.json();

        const mapglAPI = await load();
        const map = new mapglAPI.Map(mapContainerRef.current, {
          center: [82.920430, 55.030199],
          zoom: 13,
          key: import.meta.env.VITE_2GIS_API_KEY
        });

        mapInstanceRef.current = map;

        parkings.forEach((parking: Parking) => {
          const marker = new mapglAPI.Marker(map, {
            coordinates: [parking.location.coordinates.lon, parking.location.coordinates.lat],
            label: {
              text: `${parking.price_per_hour}₽/час`,
              offset: [0, -60],
              relativeAnchor: [0.5, 0],
            },
          });
          markersRef.current.push(marker);
        });

      } catch (err) {
        console.error('Ошибка:', err);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        markersRef.current.forEach(marker => marker.destroy());
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
        markersRef.current = [];
        isInitializedRef.current = false;
      }
    };
  }, []);

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Карта парковок
        </Typography>
        <Box ref={mapContainerRef} sx={{ height: 600, width: '100%' }} />
      </Paper>
    </Container>
  );
};
