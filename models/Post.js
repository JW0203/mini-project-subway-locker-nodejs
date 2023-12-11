const sequelize = require('../config/database');
const {DataTypes} = require('sequelize');

const Post = sequelize.define('posts', {
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
	},
	userId:{
		type: DataTypes.INTEGER
	}
}, {underscored:true})

module.exports = Post;