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
      authorization: true,
      primaryKey: true,
    },
    // lockerNumber: {
    //     type: DataTypes.INTEGER
    // },
    userInUse: {
      type: DataTypes.INTEGER, // 유저 pk 값 저장
    },
    startDate: {
      type: DataTypes.DATE,
    },
    expirationDate: {
      type: DataTypes.DATE,
    },
  },
  { underscored: true },
);

module.exports = Locker;
