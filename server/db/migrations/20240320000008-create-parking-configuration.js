'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ParkingConfigurations', {
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
      configuration: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          entrance: {
            x: 0,
            y: 0,
            width: 40,
            height: 40
          },
          spaces: []
        }
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
    await queryInterface.dropTable('ParkingConfigurations');
  }
};