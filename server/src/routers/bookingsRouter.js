const { Op } = require('sequelize');
const bookingsRouter = require('express').Router();
const { Booking, ParkingSpace, ParkingLot } = require('../../db/models');
const { verifyAccessToken } = require('../middleware/verifyToken');

// Создание бронирования
bookingsRouter.post('/create', verifyAccessToken, async (req, res) => {
  console.log('POST /bookings/create - Начало создания бронирования');
  console.log('Request body:', req.body);
  
  try {
    const { spaceId, startTime, endTime } = req.body;
    const userId = res.locals.user.id;

    console.log(`Проверка места ${spaceId} для пользователя ${userId}`);

    // Проверяем существование места
    const parkingSpace = await ParkingSpace.findByPk(spaceId);
    if (!parkingSpace) {
      console.log(`Место ${spaceId} не найдено`);
      return res.status(404).json({ error: 'Парковочное место не найдено' });
    }

    // Проверяем, свободно ли место
    if (!parkingSpace.is_free) {
      console.log(`Место ${spaceId} уже занято`);
      return res.status(400).json({ error: 'Место уже занято' });
    }

    // Проверяем конфликты с существующими бронированиями
    const conflictingBooking = await Booking.findOne({
      where: {
        space_id: spaceId,
        status: 'confirmed',
        [Op.or]: [
          {
            start_time: {
              [Op.between]: [startTime, endTime]
            }
          },
          {
            end_time: {
              [Op.between]: [startTime, endTime]
            }
          }
        ]
      }
    });

    if (conflictingBooking) {
      console.log(`Обнаружен конфликт бронирований для места ${spaceId}`);
      return res.status(400).json({ error: 'Выбранное время уже занято' });
    }

    // Создаем бронирование
    console.log('Создание новой записи бронирования');
    const booking = await Booking.create({
      user_id: userId,
      space_id: spaceId,
      booking_time: new Date(),
      start_time: startTime,
      end_time: endTime,
      status: 'confirmed'
    });

    // Обновляем статус места
    console.log(`Обновление статуса места ${spaceId}`);
    await parkingSpace.update({ is_free: false });

    console.log('Бронирование успешно создано:', booking.id);
    res.status(201).json(booking);

  } catch (error) {
    console.error('Ошибка при создании бронирования:', error);
    res.status(500).json({ error: 'Ошибка при создании бронирования' });
  }
});

module.exports = bookingsRouter;