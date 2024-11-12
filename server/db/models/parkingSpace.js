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
      type: DataTypes.BIGINT,
      allowNull: false
    },
    is_free: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ParkingSpace',
  });
  
  return ParkingSpace;
}; 