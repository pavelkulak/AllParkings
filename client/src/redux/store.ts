import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import parkingReducer from './slices/parkingSlice';
import favoritesReducer from './slices/favoritesSlice';
import bookingReducer from './slices/bookingSlice';
import adminReducer from './slices/adminSlice';
import chatReducer from './slices/chatSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    parking: parkingReducer,
    favorites: favoritesReducer,
    booking: bookingReducer,
    admin: adminReducer,
    chat: chatReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
