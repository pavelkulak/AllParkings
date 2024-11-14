'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Route extends Model {
    static associate(models) {
      // определите связи здесь, если они нужны
    }
  }
  
  Route.init({
    start_location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    end_location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    distance: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    estimated_time: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Route',
  });
  
  return Route;
}; 