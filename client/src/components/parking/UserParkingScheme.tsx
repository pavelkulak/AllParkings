import { Box, Typography, Stack } from '@mui/material';
import { ConstructorGrid, GRID_SIZES } from '../constructor/ParkingConstructor';
import { ParkingSpace, ParkingEntrance } from '../../types/parking';

interface UserParkingSchemeProps {
  parkingId: number;
  userSpaceId: number | null;
  spaces: ParkingSpace[];
  entrance: ParkingEntrance | null;
}

export const UserParkingScheme = ({ spaces, entrance, userSpaceId }: UserParkingSchemeProps) => {
  return (
    <Box>
      <Stack spacing={2}>
        <Typography variant="h6">Схема парковки</Typography>
        
        {/* Легенда */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 20, 
              height: 20, 
              bgcolor: '#4CAF50',
              border: '1px solid #388E3C' 
            }} />
            <Typography>Ваш автомобиль</Typography>
          </Box>
        </Box>

        {/* Схема парковки */}
        <ConstructorGrid 
          sx={{ 
            width: GRID_SIZES.medium.width, 
            height: GRID_SIZES.medium.height,
            margin: '0 auto'
          }}
        >
          {/* Вход */}
          {entrance && (
            <Box
              sx={{
                position: 'absolute',
                left: entrance.x,
                top: entrance.y,
                width: entrance.width,
                height: entrance.height,
                bgcolor: 'warning.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <Typography>Вход</Typography>
            </Box>
          )}

          {/* Парковочные места */}
          {spaces.map((space) => (
            <Box
              key={space.id}
              sx={{
                position: 'absolute',
                left: space.x,
                top: space.y,
                width: 40,
                height: 80,
                bgcolor: space.id === userSpaceId ? '#4CAF50' : 'rgba(0, 0, 0, 0.1)',
                border: '1px solid',
                borderColor: space.id === userSpaceId ? '#388E3C' : 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `rotate(${space.rotation}deg)`,
                transformOrigin: 'center center'
              }}
            >
              <Typography
                sx={{
                  transform: `rotate(${-space.rotation}deg)`,
                  color: space.id === userSpaceId ? 'white' : 'text.primary'
                }}
              >
                {space.number}
              </Typography>
            </Box>
          ))}
        </ConstructorGrid>
      </Stack>
    </Box>
  );
}; 