'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id' });
      this.belongsTo(models.ParkingLot, { foreignKey: 'parking_id' });
    }
  }
  
  Review.init({
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
    rating: {
      type: DataTypes.DECIMAL(2,1),
      allowNull: false,
      validate: {
        min: 0,
        max: 5
      }
    },
    comment: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Review',
  });
  
  return Review;
}; 