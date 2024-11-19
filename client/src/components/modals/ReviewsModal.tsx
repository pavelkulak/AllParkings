import {
  Modal,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Avatar,
  Rating,
  IconButton,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppSelector } from '../../redux/hooks';

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
  parkingId?: number;
}

export default function ReviewsModal({ 
  open, 
  onClose, 
  parkingId 
}: ReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAppSelector((state) => state.auth.token);

  const fetchReviews = async () => {
    if (!parkingId || !token) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `http://localhost:3000/api/parking-lots/${parkingId}/reviews`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setReviews(response.data || []);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      if (err.response?.status === 403) {
        setError('Вы не являетесь владельцем этой парковки');
      } else {
        setError('Не удалось загрузить отзывы');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && parkingId) {
      fetchReviews();
    } else {
      // Сбрасываем состояние при закрытии модального окна
      setReviews([]);
      setError(null);
    }
  }, [open, parkingId]);

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
          Отзывы о парковке
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
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar 
                    src={review.User.avatar || undefined}
                    sx={{ bgcolor: 'primary.main' }}
                  >
                    {review.User.name[0]}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1">
                      {review.User.name} {review.User.surname}
                    </Typography>
                    <Rating 
                      value={Number(review.rating)} 
                      readOnly 
                      size="small"
                      sx={{ my: 1 }}
                    />
                    <Typography variant="body2">
                      {review.comment}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.createdAt).toLocaleDateString()}
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