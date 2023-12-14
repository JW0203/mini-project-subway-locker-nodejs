const lockerRouter = require('./lockers');
const authRouter = require('./auth');
const mapRouter = require('./map');
const userRouter = require('./user');
const postsRouter = require('./posts');
const commentsRouter = require('./comments');
const stationsRouter = require('./stations');

module.exports = {
    lockerRouter,
    authRouter,
    mapRouter,
    userRouter,
    postsRouter,
    commentsRouter,
    stationsRouter
}