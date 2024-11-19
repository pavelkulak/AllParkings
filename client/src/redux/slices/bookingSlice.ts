import { createSlice } from '@reduxjs/toolkit';
import { getBookingHistory, getActiveBookings } from '../bookingThunks';

interface BookingState {
  activeBookings: any[];
  bookingHistory: any[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: BookingState = {
  activeBookings: [],
  bookingHistory: [],
  status: 'idle',
  error: null
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBookingHistory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getBookingHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookingHistory = action.payload;
      })
      .addCase(getBookingHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(getActiveBookings.fulfilled, (state, action) => {
        state.activeBookings = action.payload;
      });
  }
});

export default bookingSlice.reducer; 