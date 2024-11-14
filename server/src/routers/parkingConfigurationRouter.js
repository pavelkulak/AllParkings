const parkingConfigRouter = require('express').Router();
const { ParkingConfiguration, ParkingLot } = require('../../db/models');
const { verifyAccessToken } = require('../middleware/verifyToken');

// Сохранение конфигурации парковки
parkingConfigRouter.post('/:parkingId', verifyAccessToken, async (req, res) => {
  try {
    const { parkingId } = req.params;
    const { entrance, spaces } = req.body;

    const parkingLot = await ParkingLot.findByPk(parkingId);
    if (!parkingLot) {
      return res.status(404).json({ error: 'Парковка не найдена' });
    }

    const [config] = await ParkingConfiguration.findOrCreate({
      where: { parking_id: parkingId },
      defaults: {
        configuration: {
          entrance,
          spaces: spaces.map(space => ({
            number: space.number,
            x: space.x,
            y: space.y,
            rotation: space.rotation,
            width: space.width,
            height: space.height
          }))
        }
      }
    });

    if (config) {
      await config.update({
        configuration: {
          entrance,
          spaces: spaces.map(space => ({
            number: space.number,
            x: space.x,
            y: space.y,
            rotation: space.rotation,
            width: space.width,
            height: space.height
          }))
        }
      });
    }

    // Обновляем статус и вместимость парковки
    await parkingLot.update({
      capacity: spaces.length,
      status: 'active'
    });

    res.json(config);
  } catch (error) {
    console.error('Ошибка при сохранении конфигурации:', error);
    res.status(500).json({ error: 'Ошибка при сохранении конфигурации' });
  }
});

// Получение конфигурации парковки
parkingConfigRouter.get('/:parkingId', async (req, res) => {
  try {
    const config = await ParkingConfiguration.findOne({
      where: { parking_id: req.params.parkingId }
    });

    if (!config) {
      return res.status(404).json({ error: 'Конфигурация не найдена' });
    }

    res.json(config);
  } catch (error) {
    console.error('Ошибка при получении конфигурации:', error);
    res.status(500).json({ error: 'Ошибка при получении конфигурации' });
  }
});

module.exports = parkingConfigRouter;