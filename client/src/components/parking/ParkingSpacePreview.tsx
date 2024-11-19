import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Stack } from '@mui/material';
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

  const getSpaceColor = (space: ParkingSpace) => {
    if (+space.id === highlightedSpaceId) {
      return 'rgba(255, 68, 68, 0.7)';
    }
    return 'rgba(144, 238, 144, 0.7)';
  };

  const getSpaceLabel = (space: ParkingSpace) => space.space_number;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 20, 
            height: 20, 
            bgcolor: '#FF4444',
            borderRadius: 1
          }} />
          <Typography variant="body2">Ваше место</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 20, 
            height: 20, 
            bgcolor: '#90EE90',
            borderRadius: 1
          }} />
          <Typography variant="body2">Остальные места</Typography>
        </Box>
      </Box>

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
            width: 40,
            height: 80,
            bgcolor: getSpaceColor(space),
            border: '1px solid',
            borderColor: 'grey.300',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            color: space.id === highlightedSpaceId ? 'white' : 'inherit',
          }}
        >
          {getSpaceLabel(space)}
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
    </Box>
  );
};