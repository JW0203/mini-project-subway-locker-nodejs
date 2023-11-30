const sequelize = require('../config/database');
const {DataTypes} = require('sequelize');

const Message = sequelize.define('messages', {
	id:{
		type: DataTypes.INTEGER,
		autoIncrement : true,
		primaryKey: true,
	},
	title:{
		type:DataTypes.STRING,
	},
	content:{
		type:DataTypes.STRING
	}
})

module.exports = Message;