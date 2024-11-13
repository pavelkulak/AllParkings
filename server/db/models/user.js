'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.Booking, { foreignKey: 'user_id' });
      this.hasMany(models.Review, { foreignKey: 'user_id' });
      this.hasMany(models.FavoritesParking, { foreignKey: 'user_id' });
      this.hasMany(models.ParkingHistory, { foreignKey: 'user_id' });
      this.hasMany(models.ParkingLot, { foreignKey: 'owner_id' });
    }
  }
  
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    patronymic: DataTypes.STRING,
    phone: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'owner'),
      defaultValue: 'user'
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  
  return User;
};