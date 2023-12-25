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
		type: DataTypes.FLOAT
	},
	longitude:{
		type: DataTypes.FLOAT
	},
	temperature:{
		type: DataTypes.FLOAT
	},
	humidity:{
		type: DataTypes.FLOAT
	}
}, {underscored: true})

module.exports = Station;