import { createAsyncThunk } from '@reduxjs/toolkit';
import type { ParkingLot, CreateParkingSpacesPayload, ParkingSpace, Entrance } from '../types/parking.types';
import axiosInstance from '../services/axiosInstance';

export const createParking = createAsyncThunk<ParkingLot, Partial<ParkingLot>>(
  'parking/create',
  async (parkingData) => {
    const response = await axiosInstance.post<ParkingLot>('/parking-lots', parkingData);
    return response.data;
  }
);

export const getParkingById = createAsyncThunk<ParkingLot, number>(
  'parking/getById',
  async (parkingId) => {
    const response = await axiosInstance.get<ParkingLot>(`/parking-lots/${parkingId}`);
    return response.data;
  }
);

export const createParkingSpaces = createAsyncThunk<ParkingSpace[], CreateParkingSpacesPayload>(
  'parking/createSpaces',
  async ({ parkingId, spaces }) => {
    const response = await axiosInstance.post<ParkingSpace[]>(
      `/parking-lots/${parkingId}/spaces`,
      { spaces }
    );
    return response.data;
  }
);

export const getOwnerParkings = createAsyncThunk<ParkingLot[]>(
  'parking/getOwnerParkings',
  async () => {
    const response = await axiosInstance.get<ParkingLot[]>('/parking-lots/owner');
    return response.data;
  }
);

export const saveSpacesConfiguration = createAsyncThunk<ParkingSpace[], { parkingId: string; spaces: ParkingSpace[]; entrance: Entrance }>(
  'parking/saveSpaces',
  async ({ parkingId, spaces, entrance }) => {
    const formattedSpaces = spaces.map(space => ({
      space_number: space.number,
      location: JSON.stringify({ x: space.x, y: space.y, rotation: space.rotation }),
      entrance: JSON.stringify(entrance)
    }));

    const response = await axiosInstance.post<ParkingSpace[]>(
      `/parking-lots/${parkingId}/spaces`,
      { spaces: formattedSpaces }
    );
    return response.data;
  }
); 