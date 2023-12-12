const {DataTypes} = require("sequelize");
const sequelize = require('../config/database');

const Comment = sequelize.define('comments', {
	id:{
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	comment:{
		type: DataTypes.STRING
	},
	createdAt:{
		type: DataTypes.DATE
	}
	// postId:{
	//     type: DataTypes.INTEGER
	// }

},{
	underscored:true
})

module.exports = Comment;