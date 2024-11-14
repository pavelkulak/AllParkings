import { createAsyncThunk } from '@reduxjs/toolkit';
import { SaveConfigurationDto, ParkingConfiguration } from '../types/parking.types';
import axiosInstance from '../services/axiosInstance';

export const saveConfiguration = createAsyncThunk(
  'parkingConfig/save',
  async (data: SaveConfigurationDto) => {
    const response = await axiosInstance.post(
      `/parking-lots/${data.parkingId}/configuration`,
      {
        entrance: data.entrance,
        spaces: data.spaces
      }
    );
    return response.data;
  }
);

export const getConfiguration = createAsyncThunk<ParkingConfiguration, number>(
  'parking/getConfiguration',
  async (parkingId) => {
    const response = await axiosInstance.get<ParkingConfiguration>(
      `/parking-lots/${parkingId}/configuration`
    );
    return response.data;
  }
);