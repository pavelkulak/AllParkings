import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Rating,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Review } from '../../types/review';
import { Parking } from '../../types/parking';
import axiosInstance from '../../services/axiosInstance';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchParkings = async () => {
    try {
      const response = await axiosInstance.get('/parking-lots/all');
      setParkings(response.data);
    } catch (error) {
      console.error('Ошибка при получении парковок:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axiosInstance.get('/reviews/all');
      setReviews(response.data);
    } catch (error) {
      console.error('Ошибка при получении отзывов:', error);
    }
  };

  useEffect(() => {
    fetchParkings();
    fetchReviews();
  }, []);

  const filteredReviews = selectedParking 
    ? reviews.filter(review => review.parking_id === selectedParking.id)
    : reviews;

  const handleDeleteClick = (review: Review) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReview) return;
    
    try {
      await axiosInstance.delete(`/reviews/${selectedReview.id}`);
      setReviews(reviews.filter(r => r.id !== selectedReview.id));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Ошибка при удалении отзыва:', error);
    }
  };

  return (
    <Box>
      <Autocomplete
        fullWidth
        sx={{ mb: 2 }}
        options={parkings}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField {...params} label="Поиск парковки" />
        )}
        value={selectedParking}
        onChange={(_, newValue) => setSelectedParking(newValue)}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />

      {filteredReviews.map((review) => (
        <Card key={review.id} sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={
                  review.User?.avatar
                    ? `${import.meta.env.VITE_TARGET}${review.User.avatar}`
                    : undefined
                }
                alt={review.User?.name}
              />
              <Box flex={1}>
                <Typography variant="subtitle1">
                  {review.User.name} {review.User.surname}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Парковка:{" "}
                  {parkings.find((p) => p.id === review.parking_id)?.name}
                </Typography>
                <Rating value={Number(review.rating)} readOnly />
                <Typography>{review.comment}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <IconButton
                onClick={() => handleDeleteClick(review)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          </CardContent>
        </Card>
      ))}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>Вы уверены, что хотите удалить этот отзыв?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 