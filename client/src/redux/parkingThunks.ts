import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  ParkingLot,
  CreateParkingSpacesPayload,
  ParkingSpace,
  Entrance,
} from "../types/parking.types";
import axiosInstance from '../services/axiosInstance';

export const createParking = createAsyncThunk(
  'parking/create',
  async (parkingData: FormData) => {
    const response = await axiosInstance.post('/parking-lots', parkingData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

export const saveSpacesConfiguration = createAsyncThunk<
  { spaces: ParkingSpace[]; entrance: ParkingEntrance }, 
  { parkingId: string; spaces: ParkingSpace[]; entrance: Entrance }
>(
  'parking/saveSpaces',
  async ({ parkingId, spaces, entrance }) => {
    const formattedSpaces = spaces.map(space => ({
      space_number: space.number,
      location: JSON.stringify({ x: space.x, y: space.y, rotation: space.rotation })
    }));

    const response = await axiosInstance.post(
      `/parking-lots/${parkingId}/spaces`,
      { 
        spaces: formattedSpaces,
        entrance: JSON.stringify({ x: entrance.x, y: entrance.y })
      }
    );
    return response.data;
  }
); 

export const getMyParkings = createAsyncThunk<ParkingLot[]>(
  "parking/getMyParkings",
  async () => {
    const response = await axiosInstance.get<ParkingLot[]>(
      `/parking-lots/myparking/`
    );
    return response.data;
  }
);


export const updateMyParkings = createAsyncThunk<ParkingLot[]>(
  "parking/updateMyParkings",
  async (data: {
    id: string;
    name: string;
    description: string;
    location: {
      address: string;
      coordinates: {
        lat: number | null;
        lon: number | null;
      };
    };
    price_per_hour: number;
  }) => {
    const requestData = {
      name: data.name,
      description: data.description,
      location: data.location, // Передаем объект локации напрямую
      price_per_hour: data.price_per_hour,
    };

    const response = await axiosInstance.patch<ParkingLot[]>(
      `/parking-lots/myparking/update/${data.id}`,
      requestData
    );
    return response.data;
  }
);

export const deleteMyParkings = createAsyncThunk<ParkingLot[], { id: string }>(
  "parking/deleteMyParkings",
  async (data: { id: string }) => {
    const response = await axiosInstance.delete<ParkingLot[]>(
      `/parking-lots/myparking/delete/${data.id}`
    );
    return response.data;
  }
);