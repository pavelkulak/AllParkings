// src/components/admin/AdminDashboard.tsx
import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import PendingParkings from './PendingParkings';
import ReviewManagement from './ReviewManagement';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Панель администратора
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Ожидающие парковки" />
        <Tab label="Управление отзывами" />
      </Tabs>

      {activeTab === 0 && <PendingParkings />}
      {activeTab === 1 && <ReviewManagement />}
    </Box>
  );
}