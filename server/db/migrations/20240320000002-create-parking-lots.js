'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ParkingLots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      owner_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      location: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {
          address: '',
          coordinates: {
            lat: 0,
            lon: 0
          }
        }
      },
      capacity: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      price_per_hour: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'inactive'),
        defaultValue: 'pending'
      },
      average_rating: {
        type: Sequelize.DECIMAL(2, 1),
        defaultValue: 0,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      img: {
        type: Sequelize.STRING,
        allowNull: true
      },
      grid_size: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'medium',
        validate: {
          isIn: [['small', 'medium', 'large']]
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
    await queryInterface.dropTable('ParkingLots');
  }
}; 