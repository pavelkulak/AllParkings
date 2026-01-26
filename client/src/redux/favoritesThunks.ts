import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../services/axiosInstance';
import { IFavorite } from '../types/favorite.types';
import { Parking } from '../types/parking';

export const getFavorites = createAsyncThunk<Parking[], void>(
  'favorites/getFavorites',
  async () => {
    const response = await axiosInstance.get<Parking[]>('/favorites');
    return response.data;
  }
);

export const addToFavorites = createAsyncThunk<Parking, number>(
  'favorites/addToFavorites',
  async (parkingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<Parking>('/favorites', { parking_id: parkingId });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        // Если парковка уже в избранном, просто возвращаем существующие данные
        const favorites = await axiosInstance.get<IFavorite[]>('/favorites');
        const favorite = favorites.data.find((fav: IFavorite) => fav.parking_id === parkingId);
        if (favorite) {
          // Получаем полную информацию о парковке
          const parkingResponse = await axiosInstance.get<Parking>(`/parking-lots/${favorite.parking_id}`);
          return parkingResponse.data;
        }
      }
      return rejectWithValue(error.response?.data || 'Ошибка при добавлении в избранное');
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'favorites/removeFromFavorites',
  async (parkingId: number) => {
    await axiosInstance.delete(`/favorites/${parkingId}`);
    return parkingId;
  }
);
