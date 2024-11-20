import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { 
  Box, Button, Paper, Typography, Stack, IconButton,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import styled from '@emotion/styled';
import { useAppDispatch } from '../../redux/hooks';
import { saveSpacesConfiguration } from '../../redux/parkingThunks';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { ParkingSpace, Entrance, GRID_SIZES } from '../constructor/ParkingConstructor';
import axiosInstance from '../../services/axiosInstance';

interface ParkingEditorProps {
  parkingId: number;
}

// Используем те же styled компоненты из конструктора
const ConstructorGrid = styled(Box)`
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

const TemporaryRowControls = styled(Stack)({
  position: 'fixed',
  bottom: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
});

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

const AddRowDialog = ({ open, onClose, onConfirm }: {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: RowDialogData) => void;
}) => {
  const [count, setCount] = useState(2);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ count, orientation });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Добавить ряд мест</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              type="number"
              label="Количество мест"
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Ориентация</InputLabel>
              <Select
                value={orientation}
                label="Ориентация"
                onChange={(e) => setOrientation(e.target.value as 'horizontal' | 'vertical')}
              >
                <MenuItem value="horizontal">Горизонтально</MenuItem>
                <MenuItem value="vertical">Вертикально</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained">Добавить</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default function ParkingEditor({ parkingId }: ParkingEditorProps) {
  // Копируем все состояния из конструктора
  const theme = useTheme(); // Добавляем использование хука
  const dispatch = useAppDispatch();
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

  // Изменяем useEffect для загрузки существующих мест
  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        const response = await axiosInstance.get(`/parking-lots/${parkingId}/spaces`);
        
        if (response.data.gridSize) {
          setGridSize(response.data.gridSize);
        }
        
        const parsedSpaces = response.data.ParkingSpaces.map(space => ({
          id: space.id,
          number: space.space_number,
          ...JSON.parse(space.location),
          width: 40,
          height: 80
        }));
        
        setSpaces(parsedSpaces);
        
        if (response.data.ParkingEntrance) {
          const entranceData = JSON.parse(response.data.ParkingEntrance.location);
          setEntrance({
            x: entranceData.x,
            y: entranceData.y,
            width: 40,
            height: 40
          });
        } else {
          setEntranceToCenter();
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных парковки:', error);
      }
    };

    const setEntranceToCenter = () => {
      setEntrance({
        x: Math.round((GRID_SIZES[gridSize].width - 40) / 2 / 20) * 20,
        y: Math.round((GRID_SIZES[gridSize].height - 40) / 2 / 20) * 20,
        width: 40,
        height: 40
      });
    };

    if (parkingId) {
      fetchParkingData();
    }
  }, [parkingId, gridSize]);

  // Копируем ве обработчики из конструктора
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
    
    // Проверяем, не выход��т ли место за граицы после поворота
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
    console.log('Drag stop - Initial position:', { x, y });
    
    const space = spaces.find(s => s.id === id);
    console.log('Found space:', space);

    const maxX = GRID_SIZES[gridSize].width - (space?.rotation === 90 ? 80 : 40);
    const maxY = GRID_SIZES[gridSize].height - (space?.rotation === 90 ? 40 : 80);
    console.log('Bounds:', { maxX, maxY });

    const newX = Math.min(Math.max(0, Math.round(x / 20) * 20), maxX);
    const newY = Math.min(Math.max(0, Math.round(y / 20) * 20), maxY);
    console.log('New position:', { newX, newY });

    setSpaces(spaces.map(s => 
      s.id === id 
        ? { ...s, x: newX, y: newY }
        : s
    ));
  };

  const handleSpaceClick = (space: ParkingSpace) => {
    if (!isDragging) {
      setCurrentSpace(space);
      setIsDialogOpen(true);
    }
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

  const handleSaveConfiguration = async () => {
    if (!parkingId || !entrance) return;
    
    console.log('Отправляем кофигурацию с gridSize:', gridSize);
    try {
      await dispatch(saveSpacesConfiguration({
        parkingId,
        spaces,
        entrance,
        gridSize
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

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: 'calc(100vh - 64px)',
        p: 3,
        mt: 4
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Stack 
          direction="row" 
          spacing={2} 
          mb={1} 
          sx={{
            width: '100%',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Button 
            variant="contained" 
            onClick={handleAddSpace}
            startIcon={<AddIcon />}
            sx={{ minWidth: '140px', height: '36px' }}
          >
            Добавить место
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setIsRowDialogOpen(true)}
            startIcon={<AddIcon />}
            sx={{ minWidth: '140px', height: '36px' }}
          >
            Добавить ряд
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveConfiguration}
            sx={{ minWidth: '140px', height: '36px' }}
          >
            Сохранить конфигурацию
          </Button>
        </Stack>
        
        <ConstructorGrid 
          sx={{ 
            width: GRID_SIZES[gridSize].width, 
            height: GRID_SIZES[gridSize].height,
            transition: 'width 0.3s ease, height 0.3s ease',
            bgcolor: theme.palette.mode === 'dark' ? 'grey.400' : 'white'
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
          
          {spaces.map((space) => {
            
            return (
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
            );
          })}
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
      </Box>
      <AddRowDialog
        open={isRowDialogOpen}
        onClose={() => setIsRowDialogOpen(false)}
        onConfirm={handleAddRow}
      />
    </Box>
  );
}