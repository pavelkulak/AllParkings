import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { ConstructorGrid, GRID_SIZES } from '../constructor/ParkingConstructor';
import { ParkingSpace, ParkingEntrance } from '../../types/parking';

interface ParkingSpacePreviewProps {
  parkingId: number;
  highlightedSpaceId?: number;
}

export const ParkingSpacePreview = ({ parkingId, highlightedSpaceId }: ParkingSpacePreviewProps) => {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [entrance, setEntrance] = useState<ParkingEntrance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/parking-lots/${parkingId}/spaces`);
        const data = await response.json();
        setSpaces(data.ParkingSpaces || []);
        setEntrance(data.ParkingEntrance || null);
      } catch (error) {
        console.error('Ошибка при загрузке конфигурации:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, [parkingId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ConstructorGrid
      sx={{
        width: GRID_SIZES.medium.width,
        height: GRID_SIZES.medium.height,
      }}
    >
      {spaces.map((space) => (
        <Box
          key={space.id}
          sx={{
            position: 'absolute',
            left: JSON.parse(space.location).x,
            top: JSON.parse(space.location).y,
            width: 60,
            height: 120,
            bgcolor: space.id === highlightedSpaceId ? '#4CAF50' : '#90EE90',
            border: '1px solid',
            borderColor: 'grey.300',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
          }}
        >
          {space.space_number}
        </Box>
      ))}
      {entrance && (
        <Box
          sx={{
            position: 'absolute',
            left: JSON.parse(entrance.location).x,
            top: JSON.parse(entrance.location).y,
            width: 40,
            height: 40,
            bgcolor: 'warning.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
          }}
        >
          Вход
        </Box>
      )}
    </ConstructorGrid>
  );
};