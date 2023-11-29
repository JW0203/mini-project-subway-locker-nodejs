const {Sequelize} = require('sequelize');
const cls = require('cls-hooked');
const namespace = cls.createNamespace('jwt-encryption');
Sequelize.useCLS(namespace)

const sequelize = new Sequelize('subway_locker','root','',{
    host: '127.0.0.1',
    dialect: 'mysql',
    logQueryParameters : true
})

const checkConnection = async () =>{
    try{
        await sequelize.authenticate();
        console.log('연결 성공!!')

    }catch (error){
        console.log('연결 실패...')
    }
}

checkConnection();
module.exports = sequelize;