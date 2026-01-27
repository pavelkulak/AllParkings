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
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
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

      const response = await axiosInstance.get<Review[]>(`/reviews/${selectedParkingId}`);
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
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        sx={{
          width: "90%",
          maxWidth: 700,
          maxHeight: "85vh",
          bgcolor: "background.paper",
          boxShadow: (theme) => `0 24px 48px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}`,
          p: 0,
          borderRadius: 6,
          overflow: "hidden",
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
        }}
      >
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.soft' }}>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
              Отзывы пользователей
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {parkingName}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, overflow: "auto", flexGrow: 1, bgcolor: 'background.default' }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
          ) : reviews.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>Отзывов пока нет</Typography>
              <Typography variant="body2">Будьте первым, кто оставит отзыв об этой парковке!</Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {reviews.map((review) => (
                <Card
                  key={review.id}
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'background.paper' }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar
                        src={
                          review.User?.avatar
                            ? `${import.meta.env.VITE_TARGET}${review.User.avatar}`
                            : undefined
                        }
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: "primary.main",
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          boxShadow: 2
                        }}
                      >
                        {review.User?.name?.[0]}
                      </Avatar>
                      <Box flex={1}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight={800}>
                            {review.User?.name} {review.User?.surname}
                          </Typography>
                          <Typography variant="caption" sx={{ bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1.5, fontWeight: 600 }}>
                            {new Date(review.createdAt).toLocaleDateString("ru-RU", {
                              day: "numeric",
                              month: "short"
                            })}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                          <Rating
                            value={getRatingValue(review.rating)}
                            readOnly
                            precision={0.5}
                            size="small"
                          />
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{ ml: 1, opacity: 0.6 }}
                          >
                            {getRatingValue(review.rating).toFixed(1)}
                          </Typography>
                        </Box>

                        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                          {review.comment}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>

        <Divider />
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Всего отзывов: {reviews.length}
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
} 