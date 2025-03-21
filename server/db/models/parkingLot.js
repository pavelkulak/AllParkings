'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ParkingLot extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'owner_id' });
      this.hasMany(models.ParkingSpace, { foreignKey: 'parking_id' });
      this.hasOne(models.ParkingEntrance, { foreignKey: 'parking_id' });
      this.hasMany(models.Review, { foreignKey: 'parking_id' });
      this.hasMany(models.FavoritesParking, { foreignKey: 'parking_id' });
    }
  }
  
  ParkingLot.init({
    owner_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.JSON,
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
      type: DataTypes.BIGINT,
      allowNull: false
    },
    price_per_hour: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'inactive'),
      defaultValue: 'pending'
    },
    average_rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: false,
      defaultValue: 0
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true
    },
    grid_size: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'medium',
      validate: {
        isIn: [['small', 'medium', 'large']]
      }
    }
  }, {
    sequelize,
    modelName: 'ParkingLot',
  });
  
  return ParkingLot;
};
