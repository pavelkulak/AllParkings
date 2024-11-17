import { BaseLocation, ParkingLocation, ParkingStatus } from '../types/common.types';

export interface ParkingSpace {
  id: number;
  parking_id: number;
  space_number: string;
  location: BaseLocation & { rotation: number };
  is_free: boolean;
}

export interface ParkingEntrance {
  id: number;
  parking_id: number;
  location: BaseLocation;
}

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
}

export interface SaveConfigurationDto {
  parkingId: number;
  spaces: Omit<ParkingSpace, 'id' | 'parking_id' | 'is_free'>[];
  entrance: Omit<ParkingEntrance['location'], 'id' | 'parking_id'>;
}