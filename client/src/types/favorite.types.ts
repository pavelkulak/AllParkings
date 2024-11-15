export interface IFavorite {
  id: number;
  parking_id: number;
  user_id: number;
  parking: {
    id: number;
    name: string;
    address: string;
    price: number;
    rating: number;
    image?: string;
  };
} 