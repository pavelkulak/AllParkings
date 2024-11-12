'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ParkingHistory extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id' });
      this.belongsTo(models.ParkingLot, { foreignKey: 'parking_id' });
    }
  }
  
  ParkingHistory.init({
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
    },
    entry_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    exit_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    total_price: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ParkingHistory',
  });
  
  return ParkingHistory;
}; 