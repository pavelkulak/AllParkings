import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import parkingReducer from './slices/parkingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    parking: parkingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;