const Locker = require('./Locker');
const User = require('./User');
const Station = require('./Station');
const Post = require('./Post');
const Comment = require('./Comment');


// posts and comment
Post.hasMany(Comment, {foreignKey:'postId'});
Comment.belongsTo(Post,{foreignKey: 'postId'});

module.exports ={
    Locker,
    User,
    Station,
    Post,
    Comment
}