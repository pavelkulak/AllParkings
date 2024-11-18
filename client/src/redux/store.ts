import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import parkingReducer from './slices/parkingSlice';
import favoritesReducer from './slices/favoritesSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    parking: parkingReducer,
    favorites: favoritesReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;