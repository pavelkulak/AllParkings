const parkingLotsRouter = require('express').Router();
const { ParkingLot, ParkingSpace } = require('../../db/models');
const { verifyAccessToken } = require('../middleware/verifyToken');

// Создание парковки (первый этап)
parkingLotsRouter.post('/', verifyAccessToken, async (req, res) => {
  try {
    const { user } = res.locals;
    const { name, location, price_per_hour } = req.body;

    if (!name || !location || !price_per_hour) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }

    const parkingLot = await ParkingLot.create({
      owner_id: user.id,
      name,
      location,
      capacity: 0,
      price_per_hour,
      status: 'pending'
    });

    res.status(201).json(parkingLot);
  } catch (error) {
    console.error('Ошибка при создании парковки:', error);
    res.status(500).json({ 
      error: 'Ошибка при создании парковки',
      details: error.message 
    });
  }
});

// Получение парковки по ID
parkingLotsRouter.get('/:id', verifyAccessToken, async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findByPk(req.params.id, {
      include: [{ model: ParkingSpace }]
    });
    
    if (!parkingLot) {
      return res.status(404).json({ error: 'Парковка не найдена' });
    }

    res.json(parkingLot);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении парковки' });
  }
});

// Добавление парковочных мест (второй этап)
parkingLotsRouter.post('/:id/spaces', verifyAccessToken, async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findByPk(req.params.id);
    if (!parkingLot) {
      return res.status(404).json({ error: 'Парковка не найдена' });
    }

    await ParkingSpace.destroy({
      where: { parking_id: parkingLot.id }
    });

    const { spaces } = req.body;
    const createdSpaces = await Promise.all(spaces.map(space => 
      ParkingSpace.create({
        parking_id: parkingLot.id,
        space_number: space.space_number,
        location: space.location,
        is_free: true
      })
    ));

    await parkingLot.update({ 
      capacity: spaces.length,
      status: 'active'
    });

    res.status(201).json(createdSpaces);
  } catch (error) {
    console.error('Ошибка при добавлении мест:', error);
    res.status(500).json({ error: 'Ошибка при добавлении мест' });
  }
});

module.exports = parkingLotsRouter; 