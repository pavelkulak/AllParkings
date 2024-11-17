import { createSlice } from '@reduxjs/toolkit';
import type { ParkingState } from '../../types/parking.types';
import { createParking, deleteMyParkings, getMyParkings, getOwnerParkings, updateMyParkings } from '../parkingThunks';

const initialState: ParkingState = {
  parkingLots: [],
  currentParkingLot: null,
  status: 'idle',
  error: null
};

const parkingSlice = createSlice({
  name: 'parking',
  initialState,
  reducers: {
    clearParkingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createParking.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createParking.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.parkingLots.push(action.payload);
        state.currentParkingLot = action.payload;
      })
      .addCase(createParking.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Ошибка при создании парковки";
      })
      .addCase(getOwnerParkings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getOwnerParkings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.parkingLots = action.payload;
      })
      .addCase(getOwnerParkings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Ошибка при получении парковок";
      })
      .addCase(getMyParkings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getMyParkings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.parkingLots = action.payload;
      })
      .addCase(getMyParkings.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.error.message || "Ошибка при получении парковки владельца";
      })
      .addCase(updateMyParkings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateMyParkings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.parkingLots = action.payload;
      })
      .addCase(updateMyParkings.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.error.message || "Ошибка при получении парковки владельца";
      })
      .addCase(deleteMyParkings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteMyParkings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.parkingLots = action.payload;
      })
      .addCase(deleteMyParkings.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.error.message || "Ошибка при получении парковки владельца";
      });
  },
});

export const { clearParkingError } = parkingSlice.actions;
export default parkingSlice.reducer; 