const express = require('express');
const app = express();
const port = 3000;
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swaggerDef');
const HttpException = require('./middleware/HttpException');
const {lockerRouter, authRouter, mapRouter} = require('./routes');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/lockers', lockerRouter);
app.use('/auth', authRouter);
app.use('/map', mapRouter);

app.get('/', (req, res) => {
    res.send( '<< 네이버 지도앱  or login 화면>>');
})

app.use((err, req, res, next) =>{
    if(err instanceof HttpException){
        res.status(this.status).send(this.message);
    }
    res.status(500).send("internal error");
})
app.listen(port, () =>{
    console.log(`서버가 실행됩니다. http://localhost:${port}`);
})