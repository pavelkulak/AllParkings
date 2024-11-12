'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('ALTER TYPE "enum_ParkingLots_status" ADD VALUE IF NOT EXISTS \'pending\'');
    
    await queryInterface.changeColumn('ParkingLots', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'pending'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('ParkingLots', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'pending'),
      allowNull: false,
      defaultValue: 'inactive'
    });
  }
}; 