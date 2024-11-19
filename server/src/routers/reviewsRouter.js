const reviewsRouter = require('express').Router();
const { Review, User, ParkingLot } = require('../../db/models');
const { verifyAccessToken } = require('../middleware/verifyToken');
const { verifyAdmin } = require('../middleware/verifyAdmin');

// Создание отзыва
reviewsRouter.post('/', verifyAccessToken, async (req, res) => {
  console.log('Received review request:', {
    body: req.body,
    user: res.locals.user
  });

  try {
    const { parking_id, rating, comment } = req.body;
    console.log('Parsed review data:', { parking_id, rating, comment });

    const user_id = res.locals.user.id;
    
    const existingReview = await Review.findOne({
      where: { user_id, parking_id }
    });
    console.log('Existing review check:', { exists: !!existingReview });

    if (existingReview) {
      console.log('Duplicate review attempt');
      return res.status(400).json({ error: 'Вы уже оставляли отзыв для этой парковки' });
    }

    const review = await Review.create({
      user_id,
      parking_id,
      rating,
      comment
    });
    console.log('Review created:', review.toJSON());

    // Обновление среднего рейтинга
    const allReviews = await Review.findAll({
      where: { parking_id }
    });
    console.log('All reviews for parking:', allReviews.length);

    const averageRating = allReviews.length > 0
      ? Number((allReviews.reduce((acc, rev) => acc + rev.rating, 0) / allReviews.length).toFixed(1))
      : rating;
    console.log('Calculated average rating:', averageRating);

    await ParkingLot.update(
      { average_rating: averageRating },
      { where: { id: parking_id } }
    );

    res.status(201).json(review);
  } catch (error) {
    console.error('Error in review creation:', error);
    res.status(500).json({ error: 'Ошибка при создании отзыва' });
  }
});

// Получение всех отзывов для парковки
reviewsRouter.get('/parking/:parkingId', async (req, res) => {
  try {
    const { parkingId } = req.params;
    console.log('Fetching reviews for parking:', parkingId);
    
    const reviews = await Review.findAll({
      where: { parking_id: parkingId },
      include: [{
        model: User,
        attributes: ['name', 'surname', 'avatar']
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log('Found reviews:', reviews.length);
    
    console.log('Reviews with user data:', JSON.stringify(reviews, null, 2));
    if (reviews.length === 0) {
      console.log('No reviews found, returning empty array');
    }

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Ошибка при получении отзывов' });
  }
});



// Получение всех отзывов (только для админа)
reviewsRouter.get('/all', verifyAccessToken, verifyAdmin, async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: User,
          attributes: ['name', 'surname', 'avatar']
        },
        {
          model: ParkingLot,
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    console.error('Ошибка при получении отзывов:', error);
    res.status(500).json({ error: 'Ошибка при получении отзывов' });
  }
});

// Удаление отзыва (только для админа)
reviewsRouter.delete('/:id', verifyAccessToken, verifyAdmin, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' });
    }

    // Получаем parkingId до удаления отзыва
    const parkingId = review.parking_id;

    await review.destroy();

    // Пересчитываем средний рейтинг
    const allReviews = await Review.findAll({
      where: { parking_id: parkingId }
    });

    const averageRating = allReviews.length > 0
      ? Number((allReviews.reduce((acc, rev) => acc + Number(rev.rating), 0) / allReviews.length).toFixed(1))
      : 0;

    await ParkingLot.update(
      { average_rating: averageRating },
      { where: { id: parkingId } }
    );

    res.sendStatus(204);
  } catch (error) {
    console.error('Ошибка при удалении отзыва:', error);
    res.status(500).json({ error: 'Ошибка при удалении отзыва' });
  }
});

module.exports = reviewsRouter;