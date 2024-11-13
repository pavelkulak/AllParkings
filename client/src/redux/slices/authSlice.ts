import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState } from '../../types/auth.types';
import { setAccessToken } from '../../services/axiosInstance';
import { refreshToken, signIn, signUp, signOut, updateAvatar } from '../../redux/thunkActions';

const initialState: AuthState = {
  user: null,
  accessToken: '',
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUserAvatar: (state, action: PayloadAction<FormData>) => {
      updateAvatar(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        setAccessToken(action.payload.accessToken);
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unknown error';
        state.user = null;
        state.accessToken = '';
        setAccessToken('');
      })
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        setAccessToken(action.payload.accessToken);
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unknown error';
      })
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        setAccessToken(action.payload.accessToken);
      })
      .addCase(signUp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unknown error';
      })
      // Sign Out
      .addCase(signOut.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(signOut.fulfilled, (state) => {
        state.status = 'idle';
        state.user = null;
        state.accessToken = '';
        state.error = null;
        setAccessToken('');
      })
      .addCase(signOut.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Update Avatar
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        setAccessToken(action.payload.accessToken);
      })
      .addCase(updateAvatar.rejected, (state) => {
        state.error = 'Ошибка при загрузке аватара';
      });
  },
});

export const { clearError, updateUserAvatar } = authSlice.actions;
export default authSlice.reducer;