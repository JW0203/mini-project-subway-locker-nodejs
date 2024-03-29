const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');


const BlackList = sequelize.define('blackList', {
  id:{
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  accessToken:{
    type: DataTypes.STRING
  },
  expiryDate:{
    type: DataTypes.DATE
  }
}, {underscored: true})

module.exports = BlackList