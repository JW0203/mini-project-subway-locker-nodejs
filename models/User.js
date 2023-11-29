const sequelize = require('../config/database');
const {DataTypes} = require('sequelize');


const User = new sequelize.define('users', {
    id:{
        type: DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true
    },
    email :{
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    }
})

module.exports = User;