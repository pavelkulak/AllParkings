// src/components/admin/PendingParkings.tsx
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { getPendingParkings, updateParkingStatus } from '../../redux/adminThunks';
import { 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Typography,
  Dialog,
  DialogContent, 
} from '@mui/material';
import ParkingConstructorPreview from '../parking/ParkingConstructorPreview';

export default function PendingParkings() {
  const dispatch = useAppDispatch();
  const { pendingParkings, status } = useAppSelector((state) => state.admin);
  const [selectedParking, setSelectedParking] = useState(null);

  useEffect(() => {
    dispatch(getPendingParkings());
  }, [dispatch]);

  const handleApprove = async (parkingId: number) => {
    try {
      await dispatch(updateParkingStatus({ parkingId, status: 'active' })).unwrap();
      dispatch(getPendingParkings());
    } catch (error) {
      console.error('Ошибка при подтверждении парковки:', error);
    }
  };

  const handleReject = async (parkingId: number) => {
    try {
      await dispatch(updateParkingStatus({ parkingId, status: 'inactive' })).unwrap();
      dispatch(getPendingParkings());
    } catch (error) {
      console.error('Ошибка при отклонении парковки:', error);
    }
  };

  return (
    <Box>
      {pendingParkings.map((parking) => (
        <Card key={parking.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{parking.name}</Typography>
            <Button onClick={() => setSelectedParking(parking)}>
              Просмотреть конфигурацию
            </Button>
            <Button onClick={() => handleApprove(parking.id)} color="success">
              Подтвердить
            </Button>
            <Button onClick={() => handleReject(parking.id)} color="error">
              Отклонить
            </Button>
          </CardContent>
        </Card>
      ))}

      <Dialog 
        open={!!selectedParking} 
        onClose={() => setSelectedParking(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent >
          {selectedParking && (
            <ParkingConstructorPreview parkingId={selectedParking.id} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}