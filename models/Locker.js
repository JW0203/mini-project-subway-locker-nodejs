const sequelize = require('../config/database');
const {DataTypes} = require('sequelize');


const Locker = sequelize.define('lockers', {
    stationName:{
        type: DataTypes.STRING, // 역 PK 값 저장 ? 아니면
        primaryKey : true
    },
    lockerNumber: {
        type: DataTypes.INTEGER
    },
    userInUse: {
        type: DataTypes.INTEGER // 유저 pk 값 저장
    },
    startDate :{
        type: DataTypes.DATE
    },
    expirationDate:{
        type: DataTypes.DATE
    }
}, {underscored:true})

module.exports = Locker;

