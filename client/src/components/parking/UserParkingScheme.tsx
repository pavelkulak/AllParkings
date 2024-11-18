import { Box, Typography, Stack } from '@mui/material';
import { ConstructorGrid, GRID_SIZES } from '../constructor/ParkingConstructor';
import { ParkingSpace, ParkingEntrance } from '../../types/parking';
import styled from '@emotion/styled';
import { Paper } from '@mui/material';

const ParkingSpotWrapper = styled.div`
  position: absolute;
  width: 40px;
  height: 80px;
`;

const ParkingSpot = styled(Paper)<{ rotation: number }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 4px;
  background-color: rgba(25, 118, 210, 0.2);
  border: 2px solid #1976d2;
  transform: rotate(${props => props.rotation}deg);
  transform-origin: center center;
  user-select: none;
  transition: transform 0.3s ease;
  
  .MuiTypography-root {
    font-size: 0.8rem;
  }
`;

interface UserParkingSchemeProps {
  parkingId: number;
  userSpaceId: number | null;
  spaces: ParkingSpace[];
  entrance: ParkingEntrance | null;
}

export const UserParkingScheme = ({ spaces, entrance, userSpaceId }: UserParkingSchemeProps) => {
  const parsedSpaces = spaces.map(space => ({
    ...space,
    location: typeof space.location === 'string' ? JSON.parse(space.location) : space.location
  }));

  const parsedEntrance = entrance && {
    ...entrance,
    location: typeof entrance.location === 'string' ? JSON.parse(entrance.location) : entrance.location
  };

  return (
    <Box>
      <ConstructorGrid 
        sx={{ 
          width: GRID_SIZES.medium.width, 
          height: GRID_SIZES.medium.height,
          margin: '0 auto'
        }}
      >
        {parsedEntrance && (
          <Box
            sx={{
              position: 'absolute',
              left: parsedEntrance.location.x,
              top: parsedEntrance.location.y,
              width: 40,
              height: 40,
              bgcolor: 'warning.main',
              border: '2px solid',
              borderColor: 'warning.dark',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <Typography>Вход</Typography>
          </Box>
        )}

        {parsedSpaces.map((space) => (
          <ParkingSpotWrapper
            key={space.id}
            style={{
              left: space.location.x,
              top: space.location.y
            }}
          >
            <ParkingSpot
              rotation={space.location.rotation}
              elevation={3}
            >
              <Typography>{space.space_number}</Typography>
            </ParkingSpot>
          </ParkingSpotWrapper>
        ))}
      </ConstructorGrid>
    </Box>
  );
}; 