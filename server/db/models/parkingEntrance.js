'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ParkingEntrance extends Model {
    static associate(models) {
      this.belongsTo(models.ParkingLot, { foreignKey: 'parking_id' });
    }
  }
  
  ParkingEntrance.init({
    parking_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'ParkingLots',
        key: 'id'
      }
    },
    location: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        x: 0,
        y: 0,
        width: 40,
        height: 40
      }
    }
  }, {
    sequelize,
    modelName: 'ParkingEntrance',
  });
  
  return ParkingEntrance;
};