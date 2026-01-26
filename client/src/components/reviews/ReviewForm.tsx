import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Rating,
  Typography,
  Stack,
  Snackbar,
  Alert,
  Paper,
} from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import axiosInstance from '../../services/axiosInstance';

interface ReviewFormProps {
  parkingId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ReviewForm = ({ parkingId, onSuccess, onCancel }: ReviewFormProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      setSnackbar({ open: true, message: 'Пожалуйста, поставьте оценку', severity: 'error' });
      return;
    }

    try {
      setSubmitting(true);

      await axiosInstance.post('/reviews', {
        parking_id: parkingId,
        rating,
        comment: comment.trim()
      });
      
      setSnackbar({ open: true, message: 'Отзыв успешно отправлен!', severity: 'success' });
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Ошибка при отправке отзыва';
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Ваша оценка:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Rating
                name="rating"
                value={rating}
                onChange={(_, newValue) => {
                  setRating(newValue);
                }}
                icon={<Star fontSize="inherit" />}
                emptyIcon={<StarBorder fontSize="inherit" />}
                size="large"
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: '#faaf00',
                  },
                  '& .MuiRating-iconEmpty': {
                    color: '#faaf00',
                    opacity: 0.55,
                  },
                }}
              />
            </Box>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            label="Ваш комментарий"
            placeholder="Расскажите о вашем опыте использования парковки"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button 
              variant="contained" 
              type="submit"
              disabled={submitting || !rating}
              fullWidth
              sx={{
                borderRadius: 2,
                py: 1.25,
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              {submitting ? 'Отправка...' : 'Отправить'}
            </Button>
            <Button 
              variant="outlined" 
              onClick={onCancel}
              disabled={submitting}
              fullWidth
              sx={{
                borderRadius: 2,
                py: 1.25,
                textTransform: 'none',
              }}
            >
              Отмена
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}; 