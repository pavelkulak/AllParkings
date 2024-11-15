import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Review, CreateReviewDto } from '../types/review';
import axiosInstance from '../services/axiosInstance';

export const createReview = createAsyncThunk<Review, CreateReviewDto>(
  'reviews/create',
  async (reviewData) => {
    const response = await axiosInstance.post<Review>('/reviews', reviewData);
    return response.data;
  }
);

export const getParkingReviews = createAsyncThunk<Review[], number>(
  'reviews/getParkingReviews',
  async (parkingId) => {
    const response = await axiosInstance.get<Review[]>(`/reviews/parking/${parkingId}`);
    return response.data;
  }
); 