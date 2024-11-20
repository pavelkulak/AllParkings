import React, { useState, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import { UserParkingScheme } from './UserParkingScheme';
import axiosInstance from '../../services/axiosInstance';
import { ParkingSpace, Entrance } from '../constructor/ParkingConstructor';

interface ParkingEditorProps {
  parkingId: number;
}

export default function ParkingEditor({ parkingId }: ParkingEditorProps) {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [entrance, setEntrance] = useState<Entrance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        const response = await axiosInstance.get(`/parking-lots/${parkingId}/spaces`);
        setSpaces(response.data.ParkingSpaces || []);
        setEntrance(response.data.entrance || null);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке данных парковки:', error);
        setLoading(false);
      }
    };

    if (parkingId) {
      fetchParkingData();
    }
  }, [parkingId]);

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2 }}>
        <UserParkingScheme
          parkingId={parkingId}
          spaces={spaces}
          entrance={entrance}
          userSpaceId={null}
          isEditable={true}
          onSpaceUpdate={async (spaceId, newData) => {
            try {
              await axiosInstance.patch(`/parking-lots/spaces/${spaceId}`, newData);
              setSpaces(spaces.map(space => 
                space.id === spaceId ? { ...space, ...newData } : space
              ));
            } catch (error) {
              console.error('Ошибка при обновлении места:', error);
            }
          }}
          onSpaceDelete={async (spaceId) => {
            try {
              await axiosInstance.delete(`/parking-lots/spaces/${spaceId}`);
              setSpaces(spaces.filter(space => space.id !== spaceId));
            } catch (error) {
              console.error('Ошибка при удалении места:', error);
            }
          }}
        />
      </Paper>
    </Box>
  );
}