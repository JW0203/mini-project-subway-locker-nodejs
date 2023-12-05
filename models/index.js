const Locker = require('./Locker');
const User = require('./User');
const Station = require('./Station');
const Message = require('./Message');

//// user : message = 1: N
User.hasMany(Message, {foreignKey: 'userPk'});
Message.belongsTo(User, {foreignKey: 'userPk'});


module.exports ={
    Locker,
    User,
    Station,
    Message
}