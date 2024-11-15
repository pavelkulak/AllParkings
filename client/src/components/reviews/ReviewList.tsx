import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  Avatar,
  Divider,
  Stack,
  CircularProgress,
  Button,
} from '@mui/material';
import { Review } from '../../types/review';
import { ReviewForm } from './ReviewForm';
import axiosInstance from '../../services/axiosInstance';
import { useAppSelector } from '../../redux/hooks';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { Star, StarBorder } from '@mui/icons-material';

interface ReviewListProps {
  parkingId: number;
}

export const ReviewList = ({ parkingId }: ReviewListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/reviews/parking/${parkingId}`);
      console.log('Reviews response:', response.data);
      setReviews(response.data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке отзывов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [parkingId]);

  const handleReviewSubmit = () => {
    fetchReviews();
    setShowReviewForm(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        {error}
      </Typography>
    );
  }

  const userHasReview = reviews.some(review => review.user_id === user?.id);

  return (
    <Stack spacing={2}>
      {user && !userHasReview && !showReviewForm && (
        <Button 
          variant="contained" 
          onClick={() => setShowReviewForm(true)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Оставить отзыв
        </Button>
      )}

      {showReviewForm && (
        <ReviewForm 
          parkingId={parkingId} 
          onSuccess={handleReviewSubmit}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {reviews.length === 0 ? (
        <Typography color="text.secondary">
          Пока нет отзывов
        </Typography>
      ) : (
        reviews.map((review) => (
          <Box key={review.id}>
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <Avatar 
                src={review.User?.avatar 
                  ? `${import.meta.env.VITE_TARGET}${review.User.avatar}`
                  : undefined
                }
                alt={review.User?.name}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'lightblue'
                }}
              >
                {!review.User?.avatar && review.User?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  {review.User?.name || 'Пользователь'} {review.User?.surname || ''}
                </Typography>
                <Rating 
                  value={Number(review.rating)} 
                  readOnly 
                  size="small"
                  icon={<Star style={{ color: '#faaf00' }} fontSize="inherit" />}
                  emptyIcon={<StarBorder style={{ color: '#faaf00', opacity: 0.55 }} fontSize="inherit" />}
                />
                <Typography variant="body2" color="text.secondary">
                  {dayjs(review.createdAt).locale('ru').format('DD MMMM YYYY')}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" sx={{ ml: 7 }}>
              {review.comment}
            </Typography>
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))
      )}
    </Stack>
  );
}; 