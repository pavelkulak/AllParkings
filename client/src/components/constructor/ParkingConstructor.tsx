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
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import styled from '@emotion/styled';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { saveSpacesConfiguration } from '../../redux/parkingThunks';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { showNotification } from '../../redux/slices/uiSlice';
import {
  Entrance,
  ConstructorParkingSpace,
  GRID_SIZES
} from '../../types/parking.types';

// Экспортируем для обратной совместимости
export type { Entrance, ConstructorParkingSpace as ParkingSpace };
export { GRID_SIZES };

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

const ParkingSpotWrapper = styled.div<{ isMobile?: boolean }>`
  position: absolute;
  width: ${props => props.isMobile ? '30px' : '40px'};
  height: ${props => props.isMobile ? '60px' : '80px'};
`;

const ParkingSpot = styled(Paper) <{ rotation: number; isMobile?: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.isMobile ? '2px' : '4px'};
  background-color: rgba(25, 118, 210, 0.2);
  border: 2px solid #1976d2;
  cursor: move;
  transform: rotate(${props => props.rotation === 90 ? '90deg' : '0deg'});
  transform-origin: center center;
  user-select: none;
  transition: transform 0.3s ease;

  .MuiIconButton-root {
    padding: ${props => props.isMobile ? '0px' : '2px'};
    & .MuiSvgIcon-root {
      font-size: ${props => props.isMobile ? '1rem' : '1.25rem'};
    }
  }
  
  .MuiTypography-root {
    font-size: ${props => props.isMobile ? '0.6rem' : '0.8rem'};
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
  margin-top: 8px;
  display: flex;
  justify-content: center;
  width: 100%;
`;

export default function ParkingConstructor() {
  const dispatch = useAppDispatch();
  const { parkingId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [spaces, setSpaces] = useState<ConstructorParkingSpace[]>([]);
  const [entrance, setEntrance] = useState<Entrance | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSpace, setCurrentSpace] = useState<ConstructorParkingSpace | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [gridSize, setGridSize] = useState<keyof typeof GRID_SIZES>('medium');
  const [isRowDialogOpen, setIsRowDialogOpen] = useState(false);
  const [temporaryRow, setTemporaryRow] = useState<{
    spaces: ConstructorParkingSpace[];
    position: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    const centerX = Math.round((GRID_SIZES[gridSize].width - 40) / 2 / 20) * 20;
    const centerY = Math.round((GRID_SIZES[gridSize].height - 40) / 2 / 20) * 20;

    setEntrance(prev => ({
      ...prev,
      x: centerX,
      y: centerY,
      width: 40,
      height: 40
    }));

    // Загрузка существующих мест только при монтировании компонента
    if (parkingId && !spaces.length) {
      const fetchSpaces = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/parking-lots/${parkingId}/spaces`);
          if (!response.ok) throw new Error('Failed to fetch spaces');
          const data = await response.json();
          setSpaces(data.ParkingSpaces || []);
          if (data.gridSize) {
            setGridSize(data.gridSize);
          }
        } catch (error) {
          console.error('Error fetching spaces:', error);
        }
      };
      fetchSpaces();
    }
  }, [parkingId]);

  const handleEntranceDragStop = (x: number, y: number) => {
    const maxX = GRID_SIZES[gridSize].width - 40;
    const maxY = GRID_SIZES[gridSize].height - 40;

    const newX = Math.min(Math.max(0, Math.round(x / 20) * 20), maxX);
    const newY = Math.min(Math.max(0, Math.round(y / 20) * 20), maxY);

    setEntrance(prev => prev ? { ...prev, x: newX, y: newY } : null);
  };

  const handleAddSpace = () => {
    if (spaces.length >= GRID_SIZES[gridSize].maxSpaces) {
      dispatch(showNotification({
        message: `Максимальное количество мест для данного размера поля: ${GRID_SIZES[gridSize].maxSpaces}`,
        severity: 'warning'
      }));
      return;
    }

    // Вычисляем центр поля
    const centerX = Math.round((GRID_SIZES[gridSize].width - 40) / 2 / 20) * 20;
    const centerY = Math.round((GRID_SIZES[gridSize].height - 80) / 2 / 20) * 20;

    const newSpace: ConstructorParkingSpace = {
      id: Date.now(),
      number: `P-${spaces.length + 1}`,
      x: centerX,
      y: centerY,
      rotation: 0,
      width: 60,
      height: 100
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

  const handleSpaceClick = (space: ConstructorParkingSpace) => {
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
    if (spaces.length > GRID_SIZES[newSize].maxSpaces) {
      dispatch(showNotification({
        message: `Текущее количесто мест (${spaces.length}) превышает лимит для выбранного размера поля (${GRID_SIZES[newSize].maxSpaces}). Удалите лишние места.`,
        severity: 'error'
      }));
    }
  };

  const handleSaveConfiguration = async () => {
    if (!parkingId || !entrance) return;

    try {
      await dispatch(saveSpacesConfiguration({
        parkingId,
        spaces,
        entrance,
        gridSize
      })).unwrap();

      dispatch(showNotification({
        message: 'Парковка создана - ожидайте модерации',
        severity: 'success'
      }));

      // Небольшая задержка перед редиректом, чтобы пользователь успел увидеть уведомление
      setTimeout(() => {
        navigate('/myparking');
      }, 1500);
    } catch (error) {
      console.error('Ошибка при сохранении конфигурации:', error);
      dispatch(showNotification({
        message: 'Ошибка при сохранении конфигурации парковки',
        severity: 'error'
      }));
    }
  };

  const handleAddRow = (data: RowDialogData) => {
    const rowSpaces = Array.from({ length: data.count }).map((_, index) => ({
      id: Date.now() + index,
      number: `P-${spaces.length + index + 1}`,
      x: 0,
      y: 0,
      rotation: data.orientation === 'horizontal' ? 0 : 90,
      width: 60 as const,
      height: 100 as const
    }));

    const gridWidth = GRID_SIZES[gridSize].width;
    const gridHeight = GRID_SIZES[gridSize].height;

    const rowWidth = data.orientation === 'horizontal'
      ? (data.count - 1) * 60 + 40
      : 80;
    const rowHeight = data.orientation === 'horizontal'
      ? 80
      : (data.count - 1) * 60 + 40;

    const centerX = Math.round((gridWidth - rowWidth) / 2 / 20) * 20;
    const centerY = Math.round((gridHeight - rowHeight) / 2 / 20) * 20;

    const position = {
      x: Math.max(0, centerX),
      y: Math.max(0, centerY)
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
        p: { xs: 1, sm: 3 },
        mt: { xs: 1, sm: 4 }
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Stack
          direction="row"
          spacing={1}
          mb={2}
          sx={{
            width: '100%',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 1
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
          <FormControl sx={{ minWidth: 200, height: '36px' }}>
            <InputLabel>Размер поля</InputLabel>
            <Select
              value={gridSize}
              label="Размер поля"
              onChange={(e) => handleGridSizeChange(e.target.value as keyof typeof GRID_SIZES)}
              sx={{ height: '36px' }}
            >
              <MenuItem value="small">Малое (до 20 мест)</MenuItem>
              <MenuItem value="medium">Среднее (до 40 мест)</MenuItem>
              <MenuItem value="large">Большое (до 50 мест)</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleSaveConfiguration}
            sx={{ minWidth: '140px', height: '36px' }}
          >
            Сохранить конфигурацию
          </Button>
        </Stack>

        <Box sx={{
          width: '100%',
          maxHeight: isMobile ? 'calc(100vh - 350px)' : 'auto',
          overflow: 'auto',
          display: 'flex',
          justifyContent: isMobile ? 'flex-start' : 'center',
          alignItems: 'flex-start',
          py: 2,
          px: isMobile ? 0 : 2,
          border: isMobile ? '1px solid rgba(0,0,0,0.1)' : 'none',
          borderRadius: 2,
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
          '&::-webkit-scrollbar': { width: 8, height: 8 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 4 }
        }}>
          <Box sx={{
            width: isMobile ? GRID_SIZES[gridSize].width * 0.6 : GRID_SIZES[gridSize].width,
            height: isMobile ? GRID_SIZES[gridSize].height * 0.6 : GRID_SIZES[gridSize].height,
            flexShrink: 0,
            position: 'relative'
          }}>
            <ConstructorGrid
              sx={{
                width: GRID_SIZES[gridSize].width,
                height: GRID_SIZES[gridSize].height,
                transition: 'all 0.3s ease',
                bgcolor: theme.palette.mode === 'dark' ? 'grey.400' : 'white',
                transform: isMobile ? 'scale(0.6)' : 'scale(1)',
                transformOrigin: 'top left',
                margin: 0,
                position: 'absolute',
                top: 0,
                left: 0
              }}
            >
              {entrance && (
                <Draggable
                  grid={[20, 20]}
                  scale={isMobile ? 0.6 : 1}
                  position={{ x: entrance.x, y: entrance.y }}
                  onStop={(_e, data) => handleEntranceDragStop(data.x, data.y)}
                  bounds={{
                    left: 0,
                    top: 0,
                    right: GRID_SIZES[gridSize].width - (isMobile ? 30 : 40),
                    bottom: GRID_SIZES[gridSize].height - (isMobile ? 30 : 40)
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      width: isMobile ? '30px' : '40px',
                      height: isMobile ? '30px' : '40px',
                      bgcolor: 'warning.main',
                      border: '1px solid',
                      borderColor: 'grey.300',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'move',
                      color: 'white',
                      borderRadius: 1,
                      boxShadow: 2
                    }}
                  >
                    <Typography sx={{ fontSize: isMobile ? '0.6rem' : '0.8rem' }}>Вход</Typography>
                  </Box>
                </Draggable>
              )}

              {temporaryRow && (
                <Draggable
                  grid={[20, 20]}
                  scale={isMobile ? 0.6 : 1}
                  position={temporaryRow.position}
                  bounds={{
                    left: 0,
                    top: 0,
                    right: GRID_SIZES[gridSize].width - (
                      temporaryRow.spaces[0].rotation === 90
                        ? (isMobile ? 60 : 80)
                        : temporaryRow.spaces.length * (isMobile ? 30 : 60)
                    ),
                    bottom: GRID_SIZES[gridSize].height - (
                      temporaryRow.spaces[0].rotation === 90
                        ? temporaryRow.spaces.length * (isMobile ? 30 : 60)
                        : (isMobile ? 60 : 80)
                    )
                  }}
                  onStop={(_e, data) => {
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
                        ? { x: 0, y: index * (isMobile ? 30 : 60) }
                        : { x: index * (isMobile ? 30 : 60), y: 0 };

                      return (
                        <Box
                          key={space.id}
                          sx={{
                            position: 'absolute',
                            width: isMobile ? 30 : 40,
                            height: isMobile ? 60 : 80,
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
                  scale={isMobile ? 0.6 : 1}
                  position={{ x: space.x, y: space.y }}
                  onStart={handleDragStart}
                  onStop={(_e, data) => handleDragStop(space.id, data.x, data.y)}
                  bounds={{
                    left: 0,
                    top: 0,
                    right: GRID_SIZES[gridSize].width - (space.rotation === 90 ? (isMobile ? 60 : 80) : (isMobile ? 30 : 40)),
                    bottom: GRID_SIZES[gridSize].height - (space.rotation === 90 ? (isMobile ? 30 : 40) : (isMobile ? 60 : 80))
                  }}
                >
                  <ParkingSpotWrapper isMobile={isMobile}>
                    <ParkingSpot
                      rotation={space.rotation}
                      isMobile={isMobile}
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
          </Box>
        </Box>

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
    </Box>
  );
}