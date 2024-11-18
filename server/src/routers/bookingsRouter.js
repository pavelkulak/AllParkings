const { Op } = require('sequelize');
const bookingsRouter = require('express').Router();
const { Booking, ParkingSpace } = require('../../db/models');
const { verifyAccessToken } = require('../middleware/verifyToken');

// Создание бронирования
bookingsRouter.post('/create', verifyAccessToken, async (req, res) => {
  try {
    const { spaceId, startTime, endTime } = req.body;
    const userId = res.locals.user.id;

    // Проверяем существование места
    const parkingSpace = await ParkingSpace.findByPk(spaceId);
    if (!parkingSpace) {
      return res.status(404).json({ error: 'Парковочное место не найдено' });
    }

    // Проверяем конфликты с существующими бронированиями
    const conflictingBooking = await Booking.findOne({
      where: {
        space_id: spaceId,
        status: 'confirmed',
        [Op.and]: [
          {
            start_time: {
              [Op.lt]: endTime
            }
          },
          {
            end_time: {
              [Op.gt]: startTime
            }
          }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(400).json({ error: 'На выбранное время уже есть бронирование' });
    }

    // Создаем бронирование
    const booking = await Booking.create({
      user_id: userId,
      space_id: spaceId,
      booking_time: new Date(),
      start_time: startTime,
      end_time: endTime,
      status: 'confirmed'
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Ошибка при создании бронирования:', error);
    res.status(500).json({ error: 'Ошибка при создании бронирования' });
  }
});

// Получение бронирований для места
bookingsRouter.get('/space/:spaceId', verifyAccessToken, async (req, res) => {
  try {
    const { spaceId } = req.params;
    const bookings = await Booking.findAll({
      where: {
        space_id: spaceId,
        status: 'confirmed',
        end_time: {
          [Op.gt]: new Date()
        }
      }
    });
    res.json(bookings);
  } catch (error) {
    console.error('Ошибка при получении бронирований:', error);
    res.status(500).json({ error: 'Ошибка при получении бронирований' });
  }
});

bookingsRouter.get('/history', verifyAccessToken, async (req, res) => {
  try {
    const bookings = await Booking.findMany({
      where: {
        user_id: req.user.id,
        exit_time: {
          lt: new Date()
        }
      },
      include: {
        parking: {
          select: {
            name: true,
            location: true,
            price_per_hour: true
          }
        },
        space: {
          select: {
            number: true
          }
        }
      },
      orderBy: {
        entry_time: 'desc'
      }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении истории бронирований' });
  }
});

bookingsRouter.get('/active', verifyAccessToken, async (req, res) => {
  try {
    const bookings = await Booking.findMany({
      where: {
        user_id: res.locals.user.id,
        exit_time: {
          gte: new Date()
        }
      },
      include: {
        parking: {
          select: {
            name: true,
            location: true,
            price_per_hour: true
          }
        },
        space: {
          select: {
            number: true
          }
        }
      },
      orderBy: {
        entry_time: 'asc'
      }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении активных бронирований' });
  }
});

module.exports = bookingsRouter;