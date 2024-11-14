import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../services/axiosInstance';

interface CreateBookingParams {
  spaceId: number;
  startTime: string;
  endTime: string;
}

export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData: CreateBookingParams, { rejectWithValue }) => {
    try {
      console.log('Отправка запроса на создание бронирования:', bookingData);
      const response = await axiosInstance.post('/bookings/create', bookingData);
      console.log('Ответ сервера:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Ошибка при создании бронирования:', error);
      return rejectWithValue(error.response?.data?.error || 'Ошибка при создании бронирования');
    }
  }
);