import { createSlice } from '@reduxjs/toolkit';
import type { AuthState } from '../../types/auth.types';
import { setAccessToken } from '../../services/axiosInstance';
import { refreshToken, signIn, signUp, signOut, updateAvatar, updateUserProfile, changePassword, deleteAvatar, deleteAccount } from '../../redux/thunkActions';
import { connectSocket, disconnectSocket } from '../../services/socket';

const initialState: AuthState = {
  user: null,
  accessToken: '',
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      .addCase(signIn.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        setAccessToken(action.payload.accessToken);
        connectSocket(action.payload.user.id);
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unknown error';
      })
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
      .addCase(signOut.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(signOut.fulfilled, (state) => {
        state.status = 'idle';
        state.user = null;
        state.accessToken = '';
        state.error = null;
        setAccessToken('');
        disconnectSocket();
      })
      .addCase(signOut.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        if (state.user) {
          state.user.avatar = action.payload.user.avatar;
        }
        state.accessToken = action.payload.accessToken;
        setAccessToken(action.payload.accessToken);
      })
      .addCase(updateAvatar.rejected, (state) => {
        state.error = 'Ошибка при загрузке аватара';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, ...action.payload.user };
        }
        state.accessToken = action.payload.accessToken;
        setAccessToken(action.payload.accessToken);
      })
      .addCase(updateUserProfile.rejected, (state) => {
        state.error = 'Ошибка при обновлении профиля';
      })
      .addCase(deleteAvatar.fulfilled, (state, action) => {
        if (state.user) {
          state.user.avatar = action.payload.user.avatar;
        }
        state.accessToken = action.payload.accessToken;
        setAccessToken(action.payload.accessToken);
      })
      .addCase(changePassword.pending, (state) => {
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null;
        state.accessToken = '';
        setAccessToken('');
      });
  },
});

export default authSlice.reducer;