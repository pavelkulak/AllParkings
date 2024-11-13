import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MapPosition } from '../../types/map.types';

interface MapState {
  center: MapPosition;
  zoom: number;
}

const initialState: MapState = {
  center: {
    latitude: 55.75, // Москва по умолчанию
    longitude: 37.62
  },
  zoom: 11
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setMapCenter: (state, action: PayloadAction<MapPosition>) => {
      state.center = action.payload;
    },
    setMapZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    }
  }
});

export const { setMapCenter, setMapZoom } = mapSlice.actions;
export default mapSlice.reducer; 