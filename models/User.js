const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const UserAuthority = require('./enums/UserAuthority');

const User = sequelize.define(
  'users',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    authority: {
      type: DataTypes.ENUM(Object.values(UserAuthority)),
    },
  },
  {
    underscored: true,
    paranoid: true,
  },
);

module.exports = User;
