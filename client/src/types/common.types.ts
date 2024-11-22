export interface BaseLocation {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  
  export interface ParkingLocation {
    address: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  }
  
  export type ParkingStatus = 'pending' | 'active' | 'inactive';
  export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
  export type UserRole = 'user' | 'admin' | 'owner';