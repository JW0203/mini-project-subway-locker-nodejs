const express = require('express');
const sequelize = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerDef');

const HttpException = require('./middleware/HttpException');
const cors = require('cors');
// if (typeof localStorage === 'undefined' || localStorage === null) {
//   var LocalStorage = require('node-localstorage').LocalStorage;
//   localStorage = new LocalStorage('./scratch');
// }

const app = express();
const port = 3000;
const { lockerRouter, authRouter, userRouter, postsRouter, commentsRouter, stationsRouter } = require('./routes');

sequelize.sync({ alter: true });
// sequelize.sync({ force: true });

app.use(express.json());
app.use(cors());
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/lockers', lockerRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);
app.use('/stations', stationsRouter);

app.get('/', (req, res) => {
  res.send('<< 네이버 지도앱  or login 화면>>');
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof HttpException) {
    res.status(err.status).send(err.message);
    return;
  }
  res.status(500).send({
    message: 'Internal Error occurred while processing',
  });
});
app.listen(port, () => {
  console.log(`서버가 실행됩니다. http://localhost:${port}`);
});
