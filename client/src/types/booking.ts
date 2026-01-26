export interface Booking {
  id: number;
  parking_id: number;
  space_id: number;
  user_id: number;
  entry_time: string;
  exit_time: string;
  start_time?: string; // альтернативное название для entry_time
  end_time?: string; // альтернативное название для exit_time
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  parking: {
    name: string;
    location: {
      address: string;
    };
    price_per_hour: number;
  };
  space: {
    number: number;
  };
  ParkingSpace?: {
    id: number;
    space_number: string;
    ParkingLot?: {
      id: number;
      name: string;
      location?: {
        address: string;
      };
      price_per_hour: number;
    };
  };
} 