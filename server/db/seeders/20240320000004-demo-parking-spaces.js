'use strict';

function generateParkingSpaces(parkingId, count) {
  const spaces = [];
  const spacing = 80;
  
  for (let i = 0; i < count; i++) {
    const locationObj = {
      x: 100 + (i % 5) * (spacing + 40),
      y: 100 + Math.floor(i / 5) * (spacing + 40),
      rotation: 0,
      width: 40,
      height: 80
    };

    spaces.push({
      parking_id: parkingId,
      space_number: `A${i + 1}`,
      is_free: true,
      location: JSON.stringify(locationObj),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  return spaces;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const parkingLots = await queryInterface.sequelize.query(
      'SELECT id, capacity FROM "ParkingLots";'
    );
    
    const allSpaces = parkingLots[0].reduce((acc, parking) => {
      return [...acc, ...generateParkingSpaces(parking.id, parking.capacity)];
    }, []);

    return queryInterface.bulkInsert('ParkingSpaces', allSpaces);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('ParkingSpaces', null, {});
  }
};