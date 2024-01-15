const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const LockerStatus = require('./enums/LockerStatus');

const Locker = sequelize.define(
  'lockers',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    startDateTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDateTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(Object.values(LockerStatus)),
      defaultValue: LockerStatus.UNOCCUPIED,
    },
    isMyLocker: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { underscored: true },
);

module.exports = Locker;
