const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Station = sequelize.define(
  'stations',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    latitude: {
      type: DataTypes.DECIMAL(23, 20),
    },
    longitude: {
      type: DataTypes.DECIMAL(23, 20),
    },
  },
  {
    underscored: true,
    paranoid: true,
  },
);

module.exports = Station;
