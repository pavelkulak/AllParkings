// src/redux/adminThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ParkingStatus } from '../types/common.types';
import axiosInstance from '../services/axiosInstance';

export const getPendingParkings = createAsyncThunk(
  'admin/getPendingParkings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('http://localhost:3000/api/parking-lots/pending');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка при получении парковок');
    }
  }
);

export const updateParkingStatus = createAsyncThunk(
  'admin/updateParkingStatus',
  async ({ parkingId, status }: { parkingId: number; status: ParkingStatus }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`http://localhost:3000/api/parking-lots/${parkingId}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка при обновлении статуса');
    }
  }
);