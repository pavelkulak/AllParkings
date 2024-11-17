import React, { useState, useEffect } from 'react';
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
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

export interface Entrance {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ParkingSpace {
    id: number;
    number: string;
    x: number;
    y: number;
    rotation: number;
    width: 60;  // фиксированная ширина
    height: 100; // фиксированная высота
  }

export interface GridSize {
  width: number;
  height: number;
  maxSpaces: number;
}  

export const GRID_SIZES: Record<string, GridSize> = {
    small: { width: 600, height: 400, maxSpaces: 20 },
    medium: { width: 800, height: 600, maxSpaces: 40 },
    large: { width: 1000, height: 800, maxSpaces: 50 }
  };

  export const ConstructorGrid = styled(Box)`
  border: 1px solid #ccc;
  position: relative;
  background-size: 20px 20px;
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  margin: 20px;
  overflow: visible;
  box-sizing: border-box;
  transform-origin: top left;
  top: 0;
  left: 0;
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

interface RowDialogData {
  count: number;
  orientation: 'horizontal' | 'vertical';
}

const AddRowDialog = ({ 
  open, 
  onClose, 
  onConfirm 
}: { 
  open: boolean;
  onClose: () => void;
  onConfirm: (data: RowDialogData) => void;
}) => {
  const [rowData, setRowData] = useState<RowDialogData>({
    count: 2,
    orientation: 'horizontal'
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Добавить ряд парковочных мест</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1, minWidth: 300 }}>
          <TextField
            type="number"
            label="Количество мест"
            value={rowData.count}
            onChange={(e) => setRowData({
              ...rowData,
              count: Math.min(Math.max(1, parseInt(e.target.value) || 1), 10)
            })}
            inputProps={{ min: 1, max: 10 }}
          />
          <FormControl>
            <InputLabel>Ориентация</InputLabel>
            <Select
              value={rowData.orientation}
              label="Ориентация"
              onChange={(e) => setRowData({
                ...rowData,
                orientation: e.target.value as 'horizontal' | 'vertical'
              })}
            >
              <MenuItem value="horizontal">Горизонтальный</MenuItem>
              <MenuItem value="vertical">Вертикальный</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={() => onConfirm(rowData)} variant="contained">
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TemporaryRowControls = styled(Stack)`
  margin-top: 16px;
  display: flex;
  justify-content: flex-start;
  margin-left: 20px;
`;

export default function ParkingConstructor() {
  const dispatch = useAppDispatch();
  const { parkingId } = useParams();
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [entrance, setEntrance] = useState<Entrance | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSpace, setCurrentSpace] = useState<ParkingSpace | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [gridSize, setGridSize] = useState<keyof typeof GRID_SIZES>('medium');
  const [isRowDialogOpen, setIsRowDialogOpen] = useState(false);
  const [temporaryRow, setTemporaryRow] = useState<{
    spaces: ParkingSpace[];
    position: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    const centerX = Math.round((GRID_SIZES[gridSize].width - 40) / 2 / 20) * 20;
    const centerY = Math.round((GRID_SIZES[gridSize].height - 40) / 2 / 20) * 20;
    
    setEntrance({
      x: centerX,
      y: centerY,
      width: 40,
      height: 40
    });

    // Загрузка существующих мест, если есть parkingId
    if (parkingId) {
      const fetchSpaces = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/parking-lots/${parkingId}/spaces`);
          if (!response.ok) throw new Error('Failed to fetch spaces');
          const data = await response.json();
          setSpaces(data.ParkingSpaces || []);
        } catch (error) {
          console.error('Error fetching spaces:', error);
        }
      };
      fetchSpaces();
    }
  }, [parkingId, gridSize]);

  const handleEntranceDragStop = (x: number, y: number) => {
    const maxX = GRID_SIZES[gridSize].width - 40;
    const maxY = GRID_SIZES[gridSize].height - 40;
    
    const newX = Math.min(Math.max(0, Math.round(x / 20) * 20), maxX);
    const newY = Math.min(Math.max(0, Math.round(y / 20) * 20), maxY);
    
    setEntrance(prev => prev ? { ...prev, x: newX, y: newY } : null);
  };

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
  // авим небольшую задержку перед открытием диалога
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
      alert(`Текущее количесто мест (${spaces.length}) превышает лимит для выбранного размера поля (${GRID_SIZES[newSize].maxSpaces}). Удалите лишние места.`);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!parkingId || !entrance) return;
    
    try {
      await dispatch(saveSpacesConfiguration({
        parkingId,
        spaces,
        entrance
      })).unwrap();
      
      alert('Конфигурация парковки успешно сохранена');
    } catch (error) {
      console.error('Ошибка при сохранении конфигурации:', error);
      alert('Ошибка при сохранении конфигурации парковки');
    }
  };

  const handleAddRow = (data: RowDialogData) => {
    const rowSpaces = Array.from({ length: data.count }).map((_, index) => ({
      id: Date.now() + index,
      number: `P-${spaces.length + index + 1}`,
      x: 0,
      y: 0,
      rotation: data.orientation === 'horizontal' ? 0 : 90,
      width: 40,
      height: 80
    }));

    const position = {
      x: 20,
      y: 20
    };

    setTemporaryRow({
      spaces: rowSpaces,
      position
    });
    setIsRowDialogOpen(false);
  };

  const handleConfirmRow = () => {
    if (!temporaryRow) return;
    
    const finalSpaces = temporaryRow.spaces.map((space, index) => {
      const offset = space.rotation === 90 
        ? { x: 0, y: index * 60 } 
        : { x: index * 60, y: 0 };
      
      console.log('Расстояние между местами:', space.rotation === 90 ? offset.y : offset.x);
      
      const newSpace = {
        ...space,
        x: temporaryRow.position.x + offset.x,
        y: temporaryRow.position.y + offset.y
      };
      
      return newSpace;
    });
    
    setSpaces(prevSpaces => [...prevSpaces, ...finalSpaces]);
    setTemporaryRow(null);
  };

  const handleCancelRow = () => {
    setTemporaryRow(null);
  };

  useEffect(() => {
    console.log('temporaryRow зменился:', temporaryRow);
  }, [temporaryRow]);

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <Button variant="contained" onClick={handleAddSpace}>
          Добавить место
        </Button>
        <Button 
          variant="contained" 
          onClick={() => setIsRowDialogOpen(true)}
          startIcon={<AddIcon />}
        >
          Добавить ряд
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
        {entrance && (
          <Draggable
            grid={[20, 20]}
            position={{ x: entrance.x, y: entrance.y }}
            onStop={(e, data) => handleEntranceDragStop(data.x, data.y)}
            bounds={{
              left: 0,
              top: 0,
              right: GRID_SIZES[gridSize].width - 40,
              bottom: GRID_SIZES[gridSize].height - 40
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: '40px',
                height: '40px',
                bgcolor: 'warning.main',
                border: '1px solid',
                borderColor: 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'move',
                color: 'white'
              }}
            >
              <Typography>Вход</Typography>
            </Box>
          </Draggable>
        )}
        
        {temporaryRow && (
          <Draggable
            grid={[20, 20]}
            position={temporaryRow.position}
            bounds={{
              left: 0,
              top: 0,
              right: GRID_SIZES[gridSize].width - (
                temporaryRow.spaces[0].rotation === 90 
                  ? 80 
                  : temporaryRow.spaces.length * 60
              ),
              bottom: GRID_SIZES[gridSize].height - (
                temporaryRow.spaces[0].rotation === 90 
                  ? temporaryRow.spaces.length * 60
                  : 80
              )
            }}
            onStop={(e, data) => {
              const newX = Math.round(data.x / 20) * 20;
              const newY = Math.round(data.y / 20) * 20;
              setTemporaryRow({
                ...temporaryRow,
                position: { x: newX, y: newY }
              });
            }}
          >
            <Box sx={{ position: 'absolute', cursor: 'move' }}>
              {temporaryRow.spaces.map((space, index) => {
                const offset = space.rotation === 90 
                  ? { x: 0, y: index * 60 }
                  : { x: index * 60, y: 0 };

                return (
                  <Box
                    key={space.id}
                    sx={{
                      position: 'absolute',
                      width: 40,
                      height: 80,
                      transform: `rotate(${space.rotation}deg)`,
                      bgcolor: 'rgba(25, 118, 210, 0.2)',
                      border: '2px solid #1976d2',
                      borderRadius: 1,
                      transformOrigin: 'center',
                      left: offset.x,
                      top: offset.y
                    }}
                  />
                );
              })}
            </Box>
          </Draggable>
        )}
        
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

      {temporaryRow && (
        <TemporaryRowControls direction="row" spacing={1}>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleConfirmRow}
            startIcon={<CheckIcon />}
          >
            Подтвердить
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleCancelRow}
            startIcon={<ClearIcon />}
          >
            Отменить
          </Button>
        </TemporaryRowControls>
      )}

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

<AddRowDialog
  open={isRowDialogOpen}
  onClose={() => setIsRowDialogOpen(false)}
  onConfirm={handleAddRow}
/>
    </Box>
  );
}