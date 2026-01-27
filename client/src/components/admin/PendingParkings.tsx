// src/components/admin/PendingParkings.tsx
import { useEffect, useState } from 'react';
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
import { ParkingLot } from '../../types/parking.types';
import { showNotification } from '../../redux/slices/uiSlice';

export default function PendingParkings() {
  const dispatch = useAppDispatch();
  const { pendingParkings } = useAppSelector((state) => state.admin);
  const [selectedParking, setSelectedParking] = useState<ParkingLot | null>(null);

  useEffect(() => {
    dispatch(getPendingParkings());
  }, [dispatch]);

  const handleApprove = async (parkingId: number) => {
    try {
      await dispatch(updateParkingStatus({ parkingId, status: 'active' })).unwrap();
      dispatch(getPendingParkings());
      dispatch(showNotification({ message: 'Парковка подтверждена', severity: 'success' }));
    } catch (error) {
      console.error('Ошибка при подтверждении парковки:', error);
      dispatch(showNotification({ message: 'Ошибка при подтверждении парковки', severity: 'error' }));
    }
  };

  const handleReject = async (parkingId: number) => {
    try {
      await dispatch(updateParkingStatus({ parkingId, status: 'inactive' })).unwrap();
      dispatch(getPendingParkings());
      dispatch(showNotification({ message: 'Парковка отклонена', severity: 'info' }));
    } catch (error) {
      console.error('Ошибка при отклонении парковки:', error);
      dispatch(showNotification({ message: 'Ошибка при отклонении парковки', severity: 'error' }));
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