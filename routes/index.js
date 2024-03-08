const lockerRouter = require('./lockers');
const authRouter = require('./auth');
const userRouter = require('./user');
const postsRouter = require('./posts');
const commentsRouter = require('./comments');
const stationsRouter = require('./stations');

module.exports = {
  lockerRouter,
  authRouter,
  userRouter,
  postsRouter,
  commentsRouter,
  stationsRouter,
};
