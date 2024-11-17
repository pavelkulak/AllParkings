import React, { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';

interface RowCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (count: number, orientation: number) => Promise<void>;
  maxSpaces: number;
  currentSpacesCount: number;
}

export const RowCreationDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  maxSpaces,
  currentSpacesCount 
}: RowCreationDialogProps) => {
  const [count, setCount] = useState(5);
  const [orientation, setOrientation] = useState(0);
  
  const remainingSpaces = maxSpaces - currentSpacesCount;

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('RowCreationDialog: вызов onConfirm');
    await onConfirm(count, orientation);
    
    console.log('RowCreationDialog: сброс значений');
    setCount(5);
    setOrientation(0);
    
    console.log('RowCreationDialog: вызов onClose');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Создание ряда парковочных мест</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1, minWidth: 300 }}>
          <TextField
            type="number"
            label="Количество мест в ряду"
            value={count}
            onChange={(e) => setCount(Math.min(Number(e.target.value), remainingSpaces))}
            inputProps={{ min: 1, max: remainingSpaces }}
            helperText={`Доступно мест: ${remainingSpaces}`}
          />
          <FormControl fullWidth>
            <InputLabel>Ориентация</InputLabel>
            <Select
              value={orientation}
              label="Ориентация"
              onChange={(e) => setOrientation(Number(e.target.value))}
            >
              <MenuItem value={0}>Вертикальная</MenuItem>
              <MenuItem value={90}>Горизонтальная</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 