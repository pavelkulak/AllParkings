import {
  Modal,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Avatar,
  Rating,
  CircularProgress,
  Alert
} from '@mui/material';

import { useEffect, useState } from 'react';
import { useAppSelector } from '../../redux/hooks';
import axiosInstance from "../../services/axiosInstance";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  User: {
    id: number;
    name: string;
    surname: string;
    avatar: string | null;
  };
  parking_id: number;
}

interface ReviewsModalProps {
  open: boolean;
  onClose: () => void;
  selectedParkingId: number | undefined;
  parkingName?: string;
}

export default function ReviewsModal({ 
  open, 
  onClose, 
  selectedParkingId,
  parkingName 
}: ReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!selectedParkingId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(`/reviews/${selectedParkingId}`);
      setReviews(response.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Не удалось загрузить отзывы');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && selectedParkingId) {
      fetchReviews();
    }
  }, [open, selectedParkingId]);

  const getRatingValue = (rating: any): number => {
    const numRating = Number(rating);
    return Number.isNaN(numRating) ? 0 : numRating;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="reviews-modal-title"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxWidth: 800,
        maxHeight: '80vh',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        overflow: 'auto'
      }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Отзывы о парковке: {parkingName}
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : reviews.length === 0 ? (
          <Alert severity="info">Отзывов пока нет</Alert>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} sx={{ mb: 2 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar 
                    src={review.User.avatar || undefined}
                    sx={{ bgcolor: 'primary.main' }}
                  >
                    {review.User.name[0]}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      {review.User.name} {review.User.surname}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating 
                        value={getRatingValue(review.rating)} 
                        readOnly 
                        precision={1}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {getRatingValue(review.rating)}/5
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {review.comment}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.createdAt).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
              
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Modal>
  );
} 