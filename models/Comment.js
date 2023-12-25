const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const Comment = sequelize.define('comments', {
	id:{
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	content:{
		type: DataTypes.STRING
	},
	createdAt:{
		type: DataTypes.DATE
	}
},{
	underscored:true
})

module.exports = Comment;