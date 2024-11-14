'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ParkingConfiguration extends Model {
    static associate(models) {
      this.belongsTo(models.ParkingLot, { foreignKey: 'parking_id' });
    }
  }
  
  ParkingConfiguration.init({
    parking_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    configuration: {
      type: DataTypes.JSON,
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
    }
  }, {
    sequelize,
    modelName: 'ParkingConfiguration',
  });
  
  return ParkingConfiguration;
};