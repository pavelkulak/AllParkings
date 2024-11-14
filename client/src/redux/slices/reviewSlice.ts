import { createSlice } from '@reduxjs/toolkit';
import type { Review } from '../../types/review';
import { createReview, getParkingReviews } from '../reviewThunks';

interface ReviewState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  reviews: [],
  loading: false,
  error: null
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка при создании отзыва';
      })
      .addCase(getParkingReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getParkingReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(getParkingReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка при получении отзывов';
      });
  }
});

export default reviewSlice.reducer; 