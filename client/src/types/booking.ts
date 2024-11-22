export interface Booking {
  id: number;
  parking_id: number;
  space_id: number;
  user_id: number;
  entry_time: string;
  exit_time: string;
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
} 