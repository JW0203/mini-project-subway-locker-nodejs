const Locker = require('./Locker');
const User = require('./User');
const Station = require('./Station');
const Message = require('./Message');
const Comment = require('./Comment');

// user : message = 1: N
User.hasMany(Message, {foreignKey: 'userId'});
Message.belongsTo(User, {foreignKey: 'userId'});

// Message : comment = 1 : 1
// Comment 에 message_id 라는 컬럼에 해당 Message 의 id 를 추가
Message.hasMany(Comment, {foreignKey: 'messageId'});
// Message 에 comment_id 라는 컬럼에 해당 Comment 의 id 를 추가
Comment.belongsTo(Message, {foreignKey: 'messageId'});

module.exports ={
    Locker,
    User,
    Station,
    Message,
    Comment
}