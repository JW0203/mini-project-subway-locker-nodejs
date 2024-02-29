const Locker = require('./Locker');
const User = require('./User');
const Station = require('./Station');
const Post = require('./Post');
const Comment = require('./Comment');
const BlackList = require('./BlackList');
const Admin = require('./Admin');

// posts and comment
Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

// stations and lockers
Station.hasMany(Locker, { foreignKey: 'stationId' });
Locker.belongsTo(Station, { foreignKey: 'stationId' });

//user and locker
User.hasMany(Locker, { foreignKey: 'userId' });
Locker.belongsTo(User, { foreignKey: 'userId' });

//user and post
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });

// admin and comment
Admin.hasMany(Comment, { foreignKey: 'adminId' });
Comment.belongsTo(Admin, { foreignKey: 'adminId' });

module.exports = {
  Locker,
  User,
  Station,
  Post,
  Comment,
  BlackList,
  Admin,
};
