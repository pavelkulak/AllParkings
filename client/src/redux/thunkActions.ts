import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from '../types/auth.types';
import axiosInstance from '../services/axiosInstance';
import { IUser } from '../types/auth.types';

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
  },
);

export const signIn = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/signIn',
  async (credentials) => {
    const response = await axiosInstance.post<AuthResponse>(
      'auth/signin',
      credentials,
    );
    return response.data;
  },
);

export const signUp = createAsyncThunk<AuthResponse, RegisterCredentials>(
  'auth/signUp',
  async (credentials) => {
    const response = await axiosInstance.post<AuthResponse>(
      'auth/signup',
      credentials,
    );
    return response.data;
  },
);

export const signOut = createAsyncThunk<void, void>(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post('auth/signout');
    } catch (error) {
      return rejectWithValue('Ошибка при выходе из системы');
    }
  },
);

export const updateAvatar = createAsyncThunk<AuthResponse, FormData>(
  'auth/updateAvatar',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        '/upload/avatar',
        formData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue('Ошибка при загрузке аватара');
    }
  },
);

export const deleteAvatar = createAsyncThunk(
  'auth/deleteAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete('/upload/avatar');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка при удалении аватара');
    }
  }
);

export const updateUserProfile = createAsyncThunk<AuthResponse, Partial<IUser>>(
  'auth/updateUserProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<AuthResponse>(
        '/auth/profile',
        userData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue('Ошибка при обновлении профиля');
    }
  },
);

export const changePassword = createAsyncThunk<
  void,
  { currentPassword: string; newPassword: string }
>(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      await axiosInstance.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      return rejectWithValue('Ошибка при изменении пароля');
    }
  },
);
