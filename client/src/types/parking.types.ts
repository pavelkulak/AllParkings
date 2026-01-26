import { ParkingLocation, ParkingStatus } from '../types/common.types';

// Типы для базы данных (серверные)
export interface ParkingSpace {
  id: number;
  parking_id: number;
  space_number: string;
  location: string;
  is_free: boolean;
}

export interface ParkingEntrance {
  id: number;
  parking_id: number;
  location: string;
}

// Типы для конструктора (клиентские)
export interface ConstructorParkingSpace {
  id: number;
  number: string;
  x: number;
  y: number;
  rotation: number;
  width: 60;
  height: 100;
}

export interface Entrance {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridSize {
  width: number;
  height: number;
  maxSpaces: number;
}

export const GRID_SIZES: Record<string, GridSize> = {
  small: { width: 600, height: 400, maxSpaces: 20 },
  medium: { width: 800, height: 600, maxSpaces: 40 },
  large: { width: 1000, height: 800, maxSpaces: 50 }
};

export interface ParkingLot {
  id: number;
  owner_id: number;
  name: string;
  location: ParkingLocation;
  capacity: number;
  price_per_hour: number;
  status: ParkingStatus;
  average_rating: number;
  description: string;
  img?: string;
  ParkingSpaces?: ParkingSpace[];
  ParkingEntrance?: ParkingEntrance;
  gridSize?: keyof typeof GRID_SIZES;
}

export interface SaveConfigurationDto {
  parkingId: number;
  spaces: Omit<ParkingSpace, 'id' | 'parking_id' | 'is_free'>[];
  entrance: Omit<ParkingEntrance['location'], 'id' | 'parking_id'>;
}

export interface CreateParkingSpacesPayload {
  parkingId: number;
  spaces: ConstructorParkingSpace[];
}

export interface ParkingState {
  parkingLots: ParkingLot[];
  currentParkingLot: ParkingLot | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface Parking {
  id: number;
  name: string;
  description: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  price_per_hour: number;
  status: 'pending' | 'active' | 'inactive';
  average_rating: number;
  img?: string;
  gridSize?: 'small' | 'medium' | 'large';
}