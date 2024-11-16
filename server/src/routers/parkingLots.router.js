const parkingLotsRouter = require('express').Router();
const { ParkingLot, ParkingSpace, ParkingEntrance, Booking } = require('../../db/models');
const { verifyAccessToken } = require('../middleware/verifyToken');
const multer = require('multer');
const path = require('path');
const { sequelize } = require('../../db/models');
const { Op } = require('sequelize');

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

// Создание парковки (первый этап)
parkingLotsRouter.post('/', verifyAccessToken, upload.single('img'), async (req, res) => {
  try {
    const { user } = res.locals;
    const { name, description, location, price_per_hour } = req.body;

    if (!name || !location || !price_per_hour) {
      return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
    }

    const parkingLot = await ParkingLot.create({
      owner_id: user.id,
      name,
      description: description || '',
      location: JSON.parse(location),
      capacity: 0,
      price_per_hour,
      status: 'pending',
      img: req.file ? req.file.filename : null // Сохраняем только имя файла
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
        capacity: req.body.spaces.length,
        status: 'active'
      }, { transaction: t });

      return { spaces: createdSpaces, entrance };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Ошибка при сохранении конфигурации:', error);
    res.status(500).json({ error: 'Ошибка при сохранении конфигурации' });
  }
});

// Получение парковки с местами по ID (публичный эндпоинт)
parkingLotsRouter.get('/:id/spaces', async (req, res) => {
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
    
    if (!parkingLot) {
      return res.status(404).json({ error: 'Парковка не найдена' });
    }

    res.json(parkingLot);
  } catch (error) {
    console.error('Error fetching parking spaces:', error);
    res.status(500).json({ error: 'Ошибка при получении парковки' });
  }
});


//Получение всех парковок для текущего владельца
parkingLotsRouter.get("/myparking", async (req, res) => {
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

parkingLotsRouter.get('/:id/available-spaces', async (req, res) => {
  try {
    const { entry_time, exit_time } = req.query;
    const entryDate = new Date(entry_time);
    const exitDate = new Date(exit_time);
    
    const parkingLot = await ParkingLot.findByPk(req.params.id, {
      include: [
        {
          model: ParkingSpace,
          include: [{
            model: Booking,
            where: {
              [Op.or]: [
                {
                  // Начало существующего бронирования находится в пределах нового интервала
                  start_time: {
                    [Op.between]: [entryDate, exitDate]
                  }
                },
                {
                  // Конец существующего бронирования находится в пределах нового интервала
                  end_time: {
                    [Op.between]: [entryDate, exitDate]
                  }
                },
                {
                  // Новый интервал полностью входит в существующее бронирование
                  [Op.and]: [
                    { start_time: { [Op.lte]: entryDate } },
                    { end_time: { [Op.gte]: exitDate } }
                  ]
                }
              ],
              status: 'confirmed'
            },
            required: false
          }]
        },
        {
          model: ParkingEntrance
        }
      ]
    });

    if (!parkingLot) {
      return res.status(404).json({ error: 'Парковка не найдена' });
    }

    // Преобразуем места в нужный формат
    const spaces = parkingLot.ParkingSpaces.map(space => ({
      id: space.id,
      parking_id: space.parking_id,
      space_number: space.space_number,
      location: space.location,
      is_free: space.Bookings.length === 0
    }));

    res.json({
      ParkingSpaces: spaces,
      ParkingEntrance: parkingLot.ParkingEntrance
    });
  } catch (error) {
    console.error('Ошибка при получении свободных мест:', error);
    res.status(500).json({ error: 'Ошибка при получении свободных мест' });
  }
});

// Получить место пользователя на парковке
parkingLotsRouter.get('/:parkingId/user-space', verifyAccessToken, async (req, res) => {
  try {
    const { parkingId } = req.params;
    const userId = res.locals.user.id;

    // Получаем активное бронирование пользователя
    const activeBooking = await Booking.findOne({
      where: {
        user_id: userId,
        parking_id: parkingId,
        status: 'active',
        entry_time: {
          [Op.lte]: new Date()
        },
        exit_time: {
          [Op.gte]: new Date()
        }
      },
      include: [{
        model: ParkingSpace,
        attributes: ['id', 'space_number', 'location']
      }]
    });

    if (!activeBooking) {
      return res.status(404).json({ error: 'Активное бронирование не найдено' });
    }

    res.json({
      spaceId: activeBooking.ParkingSpace.id,
      spaceNumber: activeBooking.ParkingSpace.space_number,
      location: activeBooking.ParkingSpace.location
    });

  } catch (error) {
    console.error('Error fetching user space:', error);
    res.status(500).json({ error: 'Ошибка при получении информации о месте' });
  }
});

module.exports = parkingLotsRouter; 