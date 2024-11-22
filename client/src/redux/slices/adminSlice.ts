// src/redux/slices/adminSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { getPendingParkings, updateParkingStatus } from '../adminThunks';

interface AdminState {
  pendingParkings: ParkingLot[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AdminState = {
  pendingParkings: [],
  status: 'idle',
  error: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPendingParkings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getPendingParkings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pendingParkings = action.payload;
      })
      .addCase(getPendingParkings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      })
      .addCase(updateParkingStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateParkingStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.pendingParkings.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.pendingParkings.splice(index, 1);
        }
      })
      .addCase(updateParkingStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || null;
      });
  }
});

export default adminSlice.reducer;