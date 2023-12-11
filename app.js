const express = require('express');
const app = express();
const port = 3000;
const sequelize = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerDef');
const HttpException = require('./middleware/HttpException');
const {lockerRouter, authRouter,
    mapRouter, userRouter,
    postsRouter} = require('./routes');

//sequelize.sync({force:true});
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/lockers', lockerRouter);
app.use('/auth', authRouter);
app.use('/map', mapRouter);
app.use('/users', userRouter);
app.use('/posts', postsRouter);

app.get('/', (req, res) => {
    res.send( '<< 네이버 지도앱  or login 화면>>');
})

app.use((err, req, res, next) =>{
    if(err instanceof HttpException){
        res.status(err.status).send(err.message);
        return;
    }
    console.error(err);
    res.status(500).send({
        message: "Internal Error occurred while processing"
    })
    //res.status(500).send({error:err.message});
})
app.listen(port, () =>{
    console.log(`서버가 실행됩니다. http://localhost:${port}`);
})