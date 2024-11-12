export interface ParkingLot {
  id?: number;
  owner_id?: number;
  name: string;
  location: string;
  capacity: number;
  price_per_hour: number;
  status: 'pending' | 'active' | 'inactive';
  average_rating: number;
  spaces?: ParkingSpace[];
}

export interface CreateParkingDto {
  name: string;
  location: string;
  price_per_hour: number;
} 