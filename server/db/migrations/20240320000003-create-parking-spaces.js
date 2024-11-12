'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ParkingSpaces', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      parking_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'ParkingLots',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      space_number: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      is_free: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ParkingSpaces');
  }
}; 