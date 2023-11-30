const sequelize = require('../config/database');
const {DataTypes} = require('sequelize');


const Station = sequelize.define('stations', {
	id:{
		type: DataTypes.INTEGER,
		autoIncrement : true,
		primaryKey : true
	},
	name :{
		type: DataTypes.STRING
	},
	latitude: {
		type: DataTypes.INTEGER
	},
	longitude:{
		type: DataTypes.INTEGER
	}
})

module.exports = Station;