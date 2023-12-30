const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// id를 pk 값으로 하고 역명과 락커를 관계를 맺어주면??
// locker 를 만들면 자동으로 생기는것
// poster 와 comments 처럼

const Locker = sequelize.define(
  'lockers',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'unoccupied',
    },
  },
  { underscored: true },
);

module.exports = Locker;
