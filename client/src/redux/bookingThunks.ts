import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../services/axiosInstance';
import { Booking } from '../types/booking';

interface CreateBookingParams {
  spaceId: number;
  startTime: string;
  endTime: string;
}
export const getBookingHistory = createAsyncThunk(
  'booking/getHistory',
  async () => {
    const response = await axiosInstance.get<Booking[]>('/bookings/history');
    return response.data;
  }
);

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

export const getActiveBookings = createAsyncThunk(
  'booking/getActive',
  async () => {
    const response = await axiosInstance.get<Booking[]>('/bookings/active');
    return response.data;
  }
);