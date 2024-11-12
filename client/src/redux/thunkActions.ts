import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from './types/auth.types';
import axiosInstance from '../services/axiosInstance';

export const refreshToken = createAsyncThunk<AuthResponse, void>(
  'auth/refreshToken',
  async () => {
    const response = await axiosInstance.get<AuthResponse>('/tokens/refresh');
    return response.data;
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
  async () => {
    await axiosInstance.post('auth/signout');
  }
); 