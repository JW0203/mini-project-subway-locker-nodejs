const lockerRouter = require('./lockers');
const authRouter = require('./auth');
const mapRouter = require('./map');
const postRouter = require('./posts');
const commentRouter = require('./comments');


module.exports = {
    lockerRouter,
    authRouter,
    mapRouter,
    postRouter,
    commentRouter
}