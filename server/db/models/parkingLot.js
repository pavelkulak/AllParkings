'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ParkingLot extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'owner_id' });
      this.hasMany(models.ParkingSpace, { foreignKey: 'parking_id' });
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
      type: DataTypes.STRING,
      allowNull: false
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
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    average_rating: {
      type: DataTypes.BIGINT,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'ParkingLot',
  });
  
  return ParkingLot;
};
