const express = require('express');
const app = express();
const port = 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerDef');
const {lockerRouter, authRouter,
    mapRouter, postRouter,
    commentRouter} = require('./routes');
const HttpException = require('./middleware/HttpException');

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/lockers', lockerRouter);
app.use('/auth', authRouter);
app.use('/map', mapRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);

app.get('/', (req, res) => {
    res.send( '<< 네이버 지도앱  or login 화면>>');
})

app.use((err, req, res, next) => {
    console.log(err);
    if (err instanceof HttpException){
        res.status(err.status).send(err.message);
    }
    res.status(500).send({
        message: "Internal error occurred while processing"
    })
})

app.listen(port, () =>{
    console.log(`서버가 실행됩니다. http://localhost:${port}`);
})