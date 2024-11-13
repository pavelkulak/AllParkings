import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from './types/auth.types';
import axiosInstance from '../services/axiosInstance';

export const refreshToken = createAsyncThunk<AuthResponse, void>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<AuthResponse>('/tokens/refresh');
      console.log('Refresh token response:', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue('Ошибка обновления токена');
    }
  }
);

export const signIn = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/signIn',
  async (credentials) => {
    const response = await axiosInstance.post<AuthResponse>('auth/signin', credentials);
    return response.data;
  }
);

export const signUp = createAsyncThunk<AuthResponse, RegisterCredentials>(
  'auth/signUp',
  async (credentials) => {
    const response = await axiosInstance.post<AuthResponse>('auth/signup', credentials);
    return response.data;
  }
);

export const signOut = createAsyncThunk<void, void>(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post('auth/signout');
    } catch (error) {
      return rejectWithValue('Ошибка при выходе из системы');
    }
  }
);

export const updateAvatar = createAsyncThunk<AuthResponse, FormData>(
  'auth/updateAvatar',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/upload/avatar', formData);
      return response.data;
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке аватара');
    }
  }
); 