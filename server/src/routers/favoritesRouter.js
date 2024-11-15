const favoritesRouter = require('express').Router();
const { FavoritesParking, ParkingLot } = require('../../db/models');
const { verifyAccessToken } = require('../middleware/verifyToken');

// Добавить в избранное
favoritesRouter.post('/', verifyAccessToken, async (req, res) => {
  try {
    const { parking_id } = req.body;
    const user_id = res.locals.user.id;

    const existing = await FavoritesParking.findOne({
      where: { user_id, parking_id }
    });

    if (existing) {
      return res.status(400).json({ error: 'Парковка уже в избранном' });
    }

    await FavoritesParking.create({
      user_id,
      parking_id
    });

    // Получаем данные о парковке для ответа
    const parkingData = await ParkingLot.findByPk(parking_id, {
      attributes: ['id', 'name', 'location', 'price_per_hour', 'average_rating', 'img']
    });

    res.status(201).json(parkingData);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Ошибка при добавлении в избранное' });
  }
});

// Удалить из избранного
favoritesRouter.delete('/:parkingId', verifyAccessToken, async (req, res) => {
  try {
    const { parkingId } = req.params;
    const user_id = res.locals.user.id;

    const result = await FavoritesParking.destroy({
      where: { user_id, parking_id: parkingId }
    });

    if (result === 0) {
      return res.status(404).json({ error: 'Парковка не найдена в избранном' });
    }

    res.status(200).json({ message: 'Удалено из избранного' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Ошибка при удалении из избранного' });
  }
});

// Получить избранные парковки пользователя
favoritesRouter.get('/', verifyAccessToken, async (req, res) => {
  try {
    const user_id = res.locals.user.id;

    const favorites = await FavoritesParking.findAll({
      where: { user_id },
      include: [{
        model: ParkingLot,
        attributes: ['id', 'name', 'location', 'price_per_hour', 'average_rating', 'img']
      }]
    });

    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Ошибка при получении избранного' });
  }
});

module.exports = favoritesRouter;