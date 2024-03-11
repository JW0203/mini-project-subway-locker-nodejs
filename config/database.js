require('dotenv').config();
const { Sequelize } = require('sequelize');
const cls = require('cls-hooked');
const namespace = cls.createNamespace('jwt-encryption');
Sequelize.useCLS(namespace);

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logQueryParameters: true,
});

const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('연결 성공!!');
  } catch (error) {
    console.log('연결 실패...');
  }
};

checkConnection();
module.exports = sequelize;
