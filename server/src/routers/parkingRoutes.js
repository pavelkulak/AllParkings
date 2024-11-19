const express = require('express');
const router = express.Router();
const { ParkingLot, ParkingSpace, ParkingEntrance, sequelize } = require('../../db/models');

// Получение конфигурации парковки
router.get('/parking-lots/:id/configuration', async (req, res) => {
  try {
    const parkingId = req.params.id;

    // Получаем все места и вход для данной парковки
    const [spaces, entrance] = await Promise.all([
      ParkingSpace.findAll({
        where: { parkingId },
        attributes: ['id', 'number', 'x', 'y', 'rotation', 'width', 'height']
      }),
      ParkingEntrance.findOne({
        where: { parkingId },
        attributes: ['id', 'x', 'y', 'width', 'height']
      })
    ]);

    res.json({ spaces, entrance });
  } catch (error) {
    console.error('Error fetching parking configuration:', error);
    res.status(500).json({ error: 'Failed to fetch parking configuration' });
  }
});

// Сохранение конфигурации парковки
router.put('/parking-lots/:id/configuration', async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const parkingId = req.params.id;
    const { spaces, entrance } = req.body;

    // Обновляем или создаем места
    await ParkingSpace.destroy({ where: { parkingId }, transaction: t });
    if (spaces && spaces.length) {
      await ParkingSpace.bulkCreate(
        spaces.map(space => ({ 
          ...space, 
          parkingId,
          // Убедимся, что все необходимые поля присутствуют
          number: space.number || '',
          x: space.x || 0,
          y: space.y || 0,
          rotation: space.rotation || 0,
          width: space.width || 40,
          height: space.height || 80
        })),
        { transaction: t }
      );
    }

    // Обновляем или создаем вход
    await ParkingEntrance.destroy({ where: { parkingId }, transaction: t });
    if (entrance) {
      await ParkingEntrance.create(
        { 
          ...entrance, 
          parkingId,
          // Убедимся, что все необходимые поля присутствуют
          x: entrance.x || 0,
          y: entrance.y || 0,
          width: entrance.width || 40,
          height: entrance.height || 40
        },
        { transaction: t }
      );
    }

    await t.commit();
    res.json({ success: true });
  } catch (error) {
    await t.rollback();
    console.error('Error saving parking configuration:', error);
    res.status(500).json({ error: 'Failed to save parking configuration' });
  }
});

module.exports = router; 