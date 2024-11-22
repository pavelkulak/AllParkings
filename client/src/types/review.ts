export interface Review {
  id: string;
  user_id: string;
  parking_id: string;
  rating: string;
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