import { createSlice } from '@reduxjs/toolkit';
import { addToFavorites, removeFromFavorites, getFavorites } from '../favoritesThunks';
import { Parking } from '../../types/parking';

interface FavoritesState {
  favorites: Parking[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FavoritesState = {
  favorites: [],
  status: 'idle',
  error: null
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavoritesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFavorites.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.favorites = action.payload;
      })
      .addCase(getFavorites.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Ошибка при получении избранного';
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.favorites.push(action.payload);
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(
          parking => parking.id !== action.payload
        );
      });
  }
});

export const { clearFavoritesError } = favoritesSlice.actions;
export default favoritesSlice.reducer;