const lockerRouter = require('./lockers');
const authRouter = require('./auth');
const mapRouter = require('./map');
const postRouter = require('./posts');
const commentRouter = require('./comments');
const userRouter = require('./user');


module.exports = {
    lockerRouter,
    authRouter,
    mapRouter,
    postRouter,
    commentRouter,
    userRouter
}