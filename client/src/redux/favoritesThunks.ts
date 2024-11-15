import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../services/axiosInstance';

export const getFavorites = createAsyncThunk(
  'favorites/getFavorites',
  async () => {
    const response = await axios.get('/favorites');
    return response.data;
  }
);

export const addToFavorites = createAsyncThunk(
  'favorites/addToFavorites',
  async (parkingId: number, { rejectWithValue }) => {
    try {
      const response = await axios.post('/favorites', { parking_id: parkingId });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        // Если парковка уже в избранном, просто возвращаем существующие данные
        const favorites = await axios.get('/favorites');
        return favorites.data.find((fav: any) => fav.parking_id === parkingId);
      }
      return rejectWithValue(error.response?.data || 'Ошибка при добавлении в избранное');
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'favorites/removeFromFavorites',
  async (parkingId: number) => {
    await axios.delete(`/favorites/${parkingId}`);
    return parkingId;
  }
);
