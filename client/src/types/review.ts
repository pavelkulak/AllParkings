export interface Review {
  id: number;
  user_id: number;
  parking_id: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  User: {
    name: string;
    surname: string;
    avatar: string | null;
  };
}

export interface CreateReviewDto {
  parking_id: number;
  rating: number;
  comment: string;
} 