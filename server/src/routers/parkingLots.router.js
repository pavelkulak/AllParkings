const parkingLotsRouter = require('express').Router();
const { ParkingLot, ParkingSpace, ParkingEntrance, Booking } = require('../../db/models');
const { verifyAccessToken } = require('../middleware/verifyToken');
const multer = require('multer');
const path = require('path');
const { sequelize, Review, User } = require("../../db/models");
const { Op } = require('sequelize');
const { verifyAdmin } = require('../middleware/verifyAdmin');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../img/parking'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Недопустимый формат файла. Разрешены только JPEG и PNG'));
    }
  }
});

// Сначала определяем статические маршруты
parkingLotsRouter.get('/pending', verifyAccessToken, verifyAdmin, async (req, res) => {
  try {
    const pendingParkings = await ParkingLot.findAll({
      where: {
        status: 'pending'
      },
      include: [
        {
          model: ParkingSpace,
          attributes: ['id', 'space_number', 'location']
        },
        {
          model: ParkingEntrance,
          attributes: ['id', 'location']
        }
      ]
    });
    res.json(pendingParkings);
  } catch (error) {
    console.error('Ошибка при получении ожидающих парковок:', error);
    res.status(500).json({ error: 'Ошибка при получении парковок' });
  }
});

// Затем все остальные маршруты  параметрами
parkingLotsRouter.get('/:id/spaces', async (req, res) => {
  console.log('Получен запрос на пространства парковки с ID:', req.params.id);
  
  try {
    const parkingLot = await ParkingLot.findByPk(req.params.id, {
      include: [
        {
          model: ParkingSpace,
          attributes: ['id', 'space_number', 'is_free', 'location']
        },
        {
          model: ParkingEntrance,
          attributes: ['id', 'location']
        }
      ]
    });

    console.log('Результат запроса к БД:', parkingLot ? 'Парковка найдена' : 'Парковка не найдена');
    if (parkingLot) {
      console.log('Количество пространств:', parkingLot.ParkingSpaces?.length || 0);
      console.log('Наличие входа:', !!parkingLot.ParkingEntrance);
    }

    if (!parkingLot) {
      console.log('Парковка не найдена в базе данных');
      return res.status(404).json({ error: 'Парковка не найдена' });
    }

    res.json(parkingLot);
  } catch (error) {
    console.error('Ошибка при получении парковки:', error);
    res.status(500).json({ error: 'Ошибка при получении парковки' });
  }
});

// Получение всех активных парковок (публичный эндпоинт)
parkingLotsRouter.get('/all', async (req, res) => {
  try {
    const parkings = await ParkingLot.findAll({
      where: {
        status: 'active'
      }
    });
    res.json(parkings);
  } catch (error) {
    console.error('Ошибка при получении парковок:', error);
    res.status(500).json({ error: 'Ошибка при получении парковок' });
  }
});

//Получение всех парковок для текущего владельца
parkingLotsRouter.get("/myparking", verifyAccessToken, async (req, res) => {
  try {
    const { user } = res.locals;

    const parkings = await ParkingLot.findAll({
      where: {
        owner_id: user.id,
      },
    });

    res.json(parkings);
  } catch (error) {
    console.error("Ошибка при получении парковок владельца:", error);
    res.status(500).json({ error: "Ошибка при получении парковок владельца" });
  }
});


parkingLotsRouter.patch(
  "/myparking/update/:id",
  verifyAccessToken,
  async (req, res) => {
    try {
      const id = req.params.id;
      const { name, description, location, price_per_hour } = req.body;

      // Обновляем данные
      await ParkingLot.update(
        {
          name,
          description,
          location,
          price_per_hour,
        },
        {
          where: { id },
        }
      );

      // Получаем обновленную запись
      const updatedParking = await ParkingLot.findByPk(id);

      // Возвращаем обновленные данные
      res.json(updatedParking);
    } catch (error) {
      console.error("Ошибка при обновлении парковок владельца:", error);
      res
        .status(500)
        .json({ error: "Ошибка при обновлении парковок владельца" });
    }
  }
);

//Удаление парковки
parkingLotsRouter.delete("/myparking/delete/:id", verifyAccessToken, async (req, res) => {
  try {

    const parking = await ParkingLot.findByPk(req.params.id);

    await parking.destroy();
    res.sendStatus(204);
  } catch (error) {
    console.error("Ошибка при удалении парковки:", error);
    res.status(500).json({ error: "Ошибка при удалении парковки" });
  }
});


// Создание парковки (первый этап)
parkingLotsRouter.post('/', verifyAccessToken, upload.single('img'), async (req, res) => {
  try {
    const { user } = res.locals;
    const { name, description, location, price_per_hour } = req.body;

    console.log('Received data:', { name, description, location, price_per_hour });

    if (!name || !location || !price_per_hour) {
      return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
    }

    let parsedLocation;
    try {
      parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    } catch (error) {
      console.error('Error parsing location:', error);
      return res.status(400).json({ error: 'Неверный формат данных местоположения' });
    }

    const parkingLot = await ParkingLot.create({
      owner_id: user.id,
      name,
      description: description || '',
      location: parsedLocation,
      capacity: 0,
      price_per_hour: Number(price_per_hour),
      status: 'pending',
      img: req.file ? req.file.filename : null
    });

    console.log('Created parking:', parkingLot.toJSON());
    res.status(201).json(parkingLot);
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({
      error: 'Ошибка при создании парковки',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

    // Транзакция для атомарной операции
    const result = await sequelize.transaction(async (t) => {
      // Удаляем старые места и вход
      await ParkingSpace.destroy({
        where: { parking_id: parkingLot.id },
        transaction: t
      });

      await ParkingEntrance.destroy({
        where: { parking_id: parkingLot.id },
        transaction: t
      });

      // Создаем новый вход
      const entrance = await ParkingEntrance.create({
        parking_id: parkingLot.id,
        location: req.body.entrance,
      }, { transaction: t });

      // Создаем новые места
      const createdSpaces = await Promise.all(req.body.spaces.map(space =>
        ParkingSpace.create({
          parking_id: parkingLot.id,
          space_number: space.space_number,
          location: space.location,
          is_free: true
        }, { transaction: t })
      ));

      await parkingLot.update({
        capacity: req.body.spaces.length

      }, { transaction: t });

      return { spaces: createdSpaces, entrance };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Ошибка при сохранении конфигурации:', error);
    res.status(500).json({ error: 'Ошибка при сохранении конфигурации' });
  }
});

// Добавьте этот код в parkingLots.router.js
parkingLotsRouter.get('/:id/available-spaces', async (req, res) => {
  try {
    const { entry_time, exit_time } = req.query;
    const parkingId = req.params.id;

    const parkingLot = await ParkingLot.findByPk(parkingId, {
      include: [
        {
          model: ParkingSpace,
          attributes: ['id', 'space_number', 'location']
        },
        {
          model: ParkingEntrance,
          attributes: ['id', 'location']
        }
      ]
    });

    if (!parkingLot) {
      return res.status(404).json({ error: 'Парковка не найдена' });
    }

    // Получаем все бронирования для этой парковки в указанный период
    const bookings = await Booking.findAll({
      where: {
        [Op.and]: [
          { space_id: { [Op.in]: parkingLot.ParkingSpaces.map(space => space.id) } },
          { status: 'confirmed' },
          {
            [Op.or]: [
              {
                [Op.and]: [
                  { start_time: { [Op.lte]: exit_time } },
                  { end_time: { [Op.gte]: entry_time } }
                ]
              }
            ]
          }
        ]
      }
    });

    // Помечаем занятые места
    const spaces = parkingLot.ParkingSpaces.map(space => ({
      ...space.toJSON(),
      is_free: !bookings.some(booking => booking.space_id === space.id)
    }));

    res.json({
      ParkingSpaces: spaces,
      ParkingEntrance: parkingLot.ParkingEntrance
    });

  } catch (error) {
    console.error('Ошибка при получении доступных мест:', error);
    res.status(500).json({ error: 'Ошибка при получении доступных мест' });
  }
});

parkingLotsRouter.patch('/:id/status', verifyAccessToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const parkingId = req.params.id;

    const parking = await ParkingLot.findByPk(parkingId);
    if (!parking) {
      return res.status(404).json({ error: 'Парковка не найдена' });
    }

    await parking.update({ status });

    // Получаем обновленную парковку со всеми связанными данными
    const updatedParking = await ParkingLot.findByPk(parkingId, {
      include: [
        {
          model: ParkingSpace,
          attributes: ['id', 'space_number', 'location']
        },
        {
          model: ParkingEntrance,
          attributes: ['id', 'location']
        }
      ]
    });

    res.json(updatedParking);
  } catch (error) {
    console.error('Ошибка при обновлении статуса:', error);
    res.status(500).json({ error: 'Ошибка при обновлении статуса' });
  }
});

// Получение отзывов для конкретной парковки
parkingLotsRouter.get("/:id/reviews", verifyAccessToken, async (req, res) => {
  try {
    const parkingId = req.params.id;

    // Получаем отзывы для данной парковки
    const reviews = await Review.findAll({
      where: { 
        parking_id: parkingId 
      },
      include: [{
        model: User,
        attributes: ["id", "name", "surname", "avatar"]
      }],
      order: [["createdAt", "DESC"]]
    });

    console.log(`Found ${reviews.length} reviews for parking ${parkingId}`);
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Ошибка при получении отзывов" });
  }
});

// Получение данных для конструктора парковки
parkingLotsRouter.get('/parking-constructor/:id', async (req, res) => {
  try {
    const parkingId = req.params.id;
    
    const parkingData = await ParkingLot.findOne({
      where: { id: parkingId },
      include: [
        {
          model: ParkingSpace,
          attributes: ['id', 'space_number', 'location', 'is_free'],
        },
        {
          model: ParkingEntrance,
          attributes: ['id', 'location'],
        }
      ]
    });

    if (!parkingData) {
      return res.status(404).json({ error: 'Парковка не найдена' });
    }

    res.json({
      spaces: parkingData.ParkingSpaces,
      entrance: parkingData.ParkingEntrance,
      layout: parkingData.layout // если у вас есть такое поле
    });

  } catch (error) {
    console.error('Ошибка при получении данных конструктора:', error);
    res.status(500).json({ error: 'Ошибка при получении данных конструктора' });
  }
});

module.exports = parkingLotsRouter; 