import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { 
  Box, 
  Button, 
  Paper, 
  Typography,
  Stack,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { saveSpacesConfiguration } from '../../redux/parkingThunks';

interface ParkingSpace {
    id: number;
    number: string;
    x: number;
    y: number;
    rotation: number;
    width: 60;  // фиксированная ширина
    height: 100; // фиксированная высота
  }

interface GridSize {
  width: number;
  height: number;
  maxSpaces: number;
}  

const GRID_SIZES: Record<string, GridSize> = {
    small: { width: 600, height: 400, maxSpaces: 20 },
    medium: { width: 800, height: 600, maxSpaces: 40 },
    large: { width: 1000, height: 800, maxSpaces: 50 }
  };

  const ConstructorGrid = styled(Box)`
  border: 1px solid #ccc;
  position: relative;
  background-size: 20px 20px;
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  margin: 20px;
  overflow: hidden;
  box-sizing: border-box;
`;

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
  cursor: move;
  transform: rotate(${props => props.rotation === 90 ? '90deg' : '0deg'});
  transform-origin: center center;
  user-select: none;
  transition: transform 0.3s ease;

  .MuiIconButton-root {
    padding: 2px;
  }
  
  .MuiTypography-root {
    font-size: 0.8rem;
  }
`;

export default function ParkingConstructor() {
  const dispatch = useAppDispatch();
  const { parkingId } = useParams();
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSpace, setCurrentSpace] = useState<ParkingSpace | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [gridSize, setGridSize] = useState<keyof typeof GRID_SIZES>('medium');

  const handleAddSpace = () => {
    if (spaces.length >= GRID_SIZES[gridSize].maxSpaces) {
      alert(`Максимальное количество мест для данного размера поля: ${GRID_SIZES[gridSize].maxSpaces}`);
      return;
    }
    
    // Вычисляем центр поля
    const centerX = Math.round((GRID_SIZES[gridSize].width - 40) / 2 / 20) * 20;
    const centerY = Math.round((GRID_SIZES[gridSize].height - 80) / 2 / 20) * 20;
    
    const newSpace: ParkingSpace = {
      id: Date.now(),
      number: `P-${spaces.length + 1}`,
      x: centerX,
      y: centerY,
      rotation: 0,
      width: 40,
      height: 80
    };
    setSpaces([...spaces, newSpace]);
  };

  const handleRotate = (id: number) => {
    const space = spaces.find(s => s.id === id);
    if (!space) return;
  
    const newRotation = space.rotation === 90 ? 0 : 90;
    
    // Проверяем, не выходит ли место за границы после поворота
    const maxX = GRID_SIZES[gridSize].width - (newRotation === 90 ? 80 : 40);
    const maxY = GRID_SIZES[gridSize].height - (newRotation === 90 ? 40 : 80);
    
    const newX = Math.min(space.x, maxX);
    const newY = Math.min(space.y, maxY);
  
    setSpaces(spaces.map(s => 
      s.id === id 
        ? { ...s, rotation: newRotation, x: newX, y: newY }
        : s
    ));
  };

  const handleDelete = (id: number) => {
    setSpaces(spaces.filter(space => space.id !== id));
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = (id: number, x: number, y: number) => {
    const space = spaces.find(s => s.id === id);
    if (!space) return;
  
    const maxX = GRID_SIZES[gridSize].width - (space.rotation === 90 ? 80 : 40);
    const maxY = GRID_SIZES[gridSize].height - (space.rotation === 90 ? 40 : 80);
  
    const newX = Math.min(Math.max(0, Math.round(x / 20) * 20), maxX);
    const newY = Math.min(Math.max(0, Math.round(y / 20) * 20), maxY);
  
    setSpaces(spaces.map(s => 
      s.id === id 
        ? { ...s, x: newX, y: newY }
        : s
    ));
    
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
  };

 const handleSpaceClick = (space: ParkingSpace) => {
  // Добавим небольшую задержку перед открытием диалога
  setTimeout(() => {
    if (!isDragging) {
      setCurrentSpace(space);
      setIsDialogOpen(true);
    }
  }, 0);
};

  const handleSaveSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSpace) return;
  
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    setSpaces(spaces.map(space => 
      space.id === currentSpace.id 
        ? { 
            ...space, 
            number: formData.get('number') as string,
          }
        : space
    ));
    
    setIsDialogOpen(false);
  };

  const handleGridSizeChange = (newSize: keyof typeof GRID_SIZES) => {
    setGridSize(newSize);
    // Проверяем, не выходит ли текущее количество мест за новый лимит
    if (spaces.length > GRID_SIZES[newSize].maxSpaces) {
      alert(`Текущее количество мест (${spaces.length}) превышает лимит для выбранного размера поля (${GRID_SIZES[newSize].maxSpaces}). Удалите лишние места.`);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!parkingId) return;
    
    try {
      await dispatch(saveSpacesConfiguration({
        parkingId,
        spaces
      })).unwrap();
      
      alert('Конфигурация парковки успешно сохранена');
    } catch (error) {
      console.error('Ошибка при сохранении конфигурации:', error);
      alert('Ошибка при сохранении конфигурации парковки');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <Button variant="contained" onClick={handleAddSpace}>
          Добавить место
        </Button>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Размер поля</InputLabel>
          <Select
  value={gridSize}
  label="Размер поля"
  onChange={(e) => handleGridSizeChange(e.target.value as keyof typeof GRID_SIZES)}
>
            <MenuItem value="small">Малое (до 20 мест)</MenuItem>
            <MenuItem value="medium">Среднее (до 40 мест)</MenuItem>
            <MenuItem value="large">Большое (до 50 мест)</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSaveConfiguration}>
          Сохранить конфигурацию
        </Button>
      </Stack>

      <ConstructorGrid 
  sx={{ 
    width: GRID_SIZES[gridSize].width, 
    height: GRID_SIZES[gridSize].height,
    transition: 'width 0.3s ease, height 0.3s ease'
  }}
>
        {spaces.map((space) => (
       <Draggable
  key={space.id}
  grid={[20, 20]}
  position={{ x: space.x, y: space.y }}
  onStart={handleDragStart}
  onStop={(e, data) => handleDragStop(space.id, data.x, data.y)}
  bounds={{
    left: 0,
    top: 0,
    right: GRID_SIZES[gridSize].width - (space.rotation === 90 ? 80 : 40),
    bottom: GRID_SIZES[gridSize].height - (space.rotation === 90 ? 40 : 80)
  }}
>
        <ParkingSpotWrapper>
        <ParkingSpot
  rotation={space.rotation}
  elevation={3}
  onClick={() => handleSpaceClick(space)}
>
  <IconButton 
    size="small"
    onClick={(e) => {
      e.stopPropagation();
      handleDelete(space.id);
    }}
    sx={{ alignSelf: 'flex-end' }}
  >
    <DeleteIcon />
  </IconButton>
  <Typography>{space.number}</Typography>
  <IconButton 
    size="small" 
    onClick={(e) => {
      e.stopPropagation();
      handleRotate(space.id);
    }}
  >
    <RotateRightIcon />
  </IconButton>
</ParkingSpot>
        </ParkingSpotWrapper>
      </Draggable>
        ))}
      </ConstructorGrid>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
  <form onSubmit={handleSaveSpace}>
    <DialogTitle>Настройки парковочного места</DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField
          name="number"
          label="Номер места"
          defaultValue={currentSpace?.number}
          fullWidth
        />
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setIsDialogOpen(false)}>Отмена</Button>
      <Button type="submit" variant="contained">Сохранить</Button>
    </DialogActions>
  </form>
</Dialog>
    </Box>
  );
}