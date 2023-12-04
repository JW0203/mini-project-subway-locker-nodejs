const lockerRouter = require('./lockers');
const authRouter = require('./auth');
const mapRouter = require('./map');
const postRouter = require('./post');
const commentRouter = require('./comments');



module.exports = {
    lockerRouter,
    authRouter,
    mapRouter,
    postRouter,
    commentRouter
}