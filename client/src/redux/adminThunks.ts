// src/redux/adminThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ParkingStatus } from '../types/common.types';
import axiosInstance from '../services/axiosInstance';
import { ParkingLot } from '../types/parking.types';

export const getPendingParkings = createAsyncThunk<ParkingLot[], void>(
  'admin/getPendingParkings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ParkingLot[]>(`${import.meta.env.VITE_API_URL}/parking-lots/pending`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка при получении парковок');
    }
  }
);

export const updateParkingStatus = createAsyncThunk<
  ParkingLot,
  { parkingId: number; status: ParkingStatus }
>(
  'admin/updateParkingStatus',
  async ({ parkingId, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch<ParkingLot>(`${import.meta.env.VITE_API_URL}/parking-lots/${parkingId}/status`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка при обновлении статуса');
    }
  }
);