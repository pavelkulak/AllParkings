import { createSlice } from '@reduxjs/toolkit';
import { createBooking } from '../bookingThunks';

interface BookingState {
  currentBooking: any | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: BookingState = {
  currentBooking: null,
  status: 'idle',
  error: null
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        console.log('Создание бронирования: pending');
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        console.log('Создание бронирования: fulfilled', action.payload);
        state.status = 'succeeded';
        state.currentBooking = action.payload;
        state.error = null;
      })
      .addCase(createBooking.rejected, (state, action) => {
        console.log('Создание бронирования: rejected', action.error);
        state.status = 'failed';
        state.error = action.error.message || 'Ошибка при создании бронирования';
      });
  },
});

export const { clearBookingError } = bookingSlice.actions;
export default bookingSlice.reducer;