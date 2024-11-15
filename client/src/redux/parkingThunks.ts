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


export const updateMyParkings = createAsyncThunk<
  ParkingLot[]  
>(
  "parking/updateMyParkings",
  async ({ id, name, description, location, price_per_hour, status }) => {
    // Проверяем и подготавливаем данные локации
    const locationData = {
      address: location?.address || "",
      coordinates: {
        lat: location?.coordinates?.lat || null,
        lon: location?.coordinates?.lon || null,
      },
    };

    const locationJson = JSON.stringify(locationData);

    // Подготавливаем данные для запроса
    const requestData = {
      name: name || "",
      description: description || "",
      location: locationJson,
      price_per_hour: price_per_hour || 0,
      ...(status && { status }), // Добавляем status только если он определён
    };

    const response = await axiosInstance.patch<ParkingLot[]>(
      `/parking-lots/myparking/update/${id}`,
      requestData
    );
    return response.data;
  }
);

export const deleteMyParkings = createAsyncThunk<ParkingLot[], string>(
  "parking/deleteMyParkings",
  async (id) => {
    const response = await axiosInstance.delete<ParkingLot[]>(
      `/parking-lots/myparking/delete/${id}`
    );
    return response.data;
  }
);
