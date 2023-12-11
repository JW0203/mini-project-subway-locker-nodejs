const lockerRouter = require('./lockers');
const authRouter = require('./auth');
const mapRouter = require('./map');
const userRouter = require('./user');
const postsRouter = require('./posts')

module.exports = {
    lockerRouter,
    authRouter,
    mapRouter,
    userRouter,
    postsRouter
}