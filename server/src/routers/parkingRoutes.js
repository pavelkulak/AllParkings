const express = require('express');
const router = express.Router();
const { ParkingLot, ParkingSpace, ParkingEntrance, sequelize } = require('../../db/models');

// Получение конфигурации парковки
router.get('/parking-lots/:id/configuration', async (req, res) => {
  try {
    const parkingId = req.params.id;

    // Получаем парковку, все места и вход
    const [parkingLot, spaces, entrance] = await Promise.all([
      ParkingLot.findByPk(parkingId, {
        attributes: ['grid_size']
      }),
      ParkingSpace.findAll({
        where: { parkingId },
        attributes: ['id', 'number', 'x', 'y', 'rotation', 'width', 'height']
      }),
      ParkingEntrance.findOne({
        where: { parkingId },
        attributes: ['id', 'x', 'y', 'width', 'height']
      })
    ]);

    res.json({ 
      spaces, 
      entrance,
      gridSize: parkingLot?.grid_size || 'medium'
    });
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
    const { spaces, entrance, gridSize } = req.body;
    
    console.log('Получен запрос на сохранение конфигурации:');
    console.log('parkingId:', parkingId);
    console.log('gridSize:', gridSize);

    // Обновляем gridSize в ParkingLot
    const [updatedRows] = await ParkingLot.update(
      { 
        grid_size: gridSize,
        updatedAt: new Date()
      },
      { 
        where: { id: parkingId },
        transaction: t
      }
    );

    if (updatedRows === 0) {
      throw new Error('Не удалось обновить размер сетки парковки');
    }

    // Проверяем обновление внутри транзакции
    const parkingLot = await ParkingLot.findByPk(parkingId, { 
      transaction: t,
      attributes: ['id', 'grid_size']
    });

    console.log('Проверка после обновления:', {
      id: parkingLot.id,
      grid_size: parkingLot.grid_size
    });

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
    res.json({ 
      success: true,
      gridSize: parkingLot.grid_size 
    });
  } catch (error) {
    await t.rollback();
    console.error('Ошибка при сохранении:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 