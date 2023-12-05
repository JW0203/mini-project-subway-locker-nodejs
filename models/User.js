const sequelize = require('../config/database');
const {DataTypes} = require('sequelize');


const User = sequelize.define('users', {
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
}, {underscored:true})

module.exports = User;