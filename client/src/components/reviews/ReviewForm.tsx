import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Rating,
  Typography,
  Stack,
  Alert,
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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hover, setHover] = useState(-1);

  useEffect(() => {
    console.log('Component mounted');
  }, []);

  useEffect(() => {
    console.log('Rating state changed:', rating);
    console.log('Button should be disabled:', submitting || !rating);
  }, [rating, submitting]);

  const handleRatingChange = (event: React.SyntheticEvent, newValue: number | null) => {
    console.log('Rating change:', {
      oldValue: rating,
      newValue,
      eventType: event.type
    });
    setRating(newValue);
    setError(null);
  };

  const labels: { [index: string]: string } = {
    0: 'Выберите оценку',
    1: 'Ужасно',
    2: 'Плохо',
    3: 'Нормально',
    4: 'Хорошо',
    5: 'Отлично',
  };

  console.log('Current rating:', rating);
  console.log('Current hover:', hover);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with rating:', rating);
    
    if (!rating) {
      console.log('Rating is missing');
      setError('Пожалуйста, поставьте оценку');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Sending review data:', {
        parking_id: parkingId,
        rating,
        comment: comment.trim()
      });

      await axiosInstance.post('/reviews', {
        parking_id: parkingId,
        rating,
        comment: comment.trim()
      });
      console.log('Review submitted successfully');
      onSuccess();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Ошибка при отправке отзыва');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography>Ваша оценка:</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Rating
  name="rating"
  value={rating}
  onChange={(_, newValue) => {
    setRating(newValue);
    setError(null);
  }}
  icon={<Star fontSize="inherit" />}
  emptyIcon={<StarBorder fontSize="inherit" />}
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
        />

        <Stack direction="row" spacing={1}>
          <Button 
            variant="contained" 
            type="submit"
            disabled={submitting || !rating}
          >
            Отправить
          </Button>
          <Button 
            variant="outlined" 
            onClick={onCancel}
            disabled={submitting}
          >
            Отмена
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}; 