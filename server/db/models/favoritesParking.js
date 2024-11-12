'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FavoritesParking extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id' });
      this.belongsTo(models.ParkingLot, { foreignKey: 'parking_id' });
    }
  }
  
  FavoritesParking.init({
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    parking_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'ParkingLots',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'FavoritesParking',
  });
  
  return FavoritesParking;
}; 