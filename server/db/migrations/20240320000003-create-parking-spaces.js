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
        type: Sequelize.STRING,
        allowNull: false
      },
      is_free: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      location: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          x: 0,
          y: 0,
          rotation: 0,
          width: 40,
          height: 80
        }
      },
      entrance: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null
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