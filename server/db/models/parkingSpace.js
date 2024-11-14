'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ParkingSpace extends Model {
    static associate(models) {
      this.belongsTo(models.ParkingLot, { foreignKey: 'parking_id' });
      this.hasMany(models.Booking, { foreignKey: 'space_id' });
    }
  }
  
  ParkingSpace.init({
    parking_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'ParkingLots',
        key: 'id'
      }
    },
    space_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_free: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    location: {
      type: DataTypes.JSON,
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
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    }
  }, {
    sequelize,
    modelName: 'ParkingSpace',
  });
  
  return ParkingSpace;
}; 