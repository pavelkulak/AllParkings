export interface Parking {
  id: string;
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
  img?: string;
} 