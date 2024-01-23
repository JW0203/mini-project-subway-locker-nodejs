require('dotenv').config();
const { Station, Locker } = require('../models');
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const HttpException = require('../middleware/HttpException');
const authenticateToken = require('../middleware/authenticateToken');
const { checkWeather } = require('../functions/weatherApi');
const checkRequiredParameters = require('../functions/checkRequiredParameters');

/**
 * @swagger
 * /stations:
 *   post:
 *     summary: 역 추가
 *     requestBody:
 *       description: 역 추가를 위한 이름, 좌표 값 필요, array 형식으로 입력 가능
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *                 example: "서울역"
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: 37.5283169
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: 126.9294254
 *     responses:
 *       201:
 *         description: 역 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                   example: "서울역"
 *                 latitude:
 *                   type: number
 *                   format: float
 *                   example: 37.5283169
 *                 longitude:
 *                   type: number
 *                   format: float
 *                   example: 126.9294254
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *
 *
 *
 */
router.post('/', async (req, res, next) => {
  try {
    const { data } = req.body;

    const result = checkRequiredParameters([data]);
    if (result.validation === false) {
      throw new HttpException(result.statusCode, result.message);
      return;
    }

    for (let n in data) {
      const keys = Object.keys(data[n]);
      if (keys.toString !== ['name', 'latitude', 'longitude'].toString) {
        throw new HttpException(400, 'data의 key 값이 잘 못되었습니다.');
        return;
      }
      const { name, latitude, longitude } = data[n];
      if (typeof name != 'string') {
        throw new HttpException(400, 'name은 문자로 입력해주세요.');
        return;
      }
      if (typeof latitude != 'number') {
        throw new HttpException(400, 'latitude 는 숫자로 입력해주세요.');
      }
      if (!(-90 < latitude && 90 > latitude)) {
        throw new HttpException(400, 'latitude 는 -90 에서 90 사이의 값을 입력해주세요.');
        return;
      }
      if (typeof longitude != 'number') {
        throw new HttpException(400, 'longitude 는 숫자로 입력해주세요.');
      }
      if (!(-180 < longitude && 180 > longitude)) {
        throw new HttpException(400, 'longitude 는 -180 에서 180 사이의 값을 입력해주세요.');
        return;
      }

      const stationDuplication = await Station.findOne({
        where: { name },
      });

      if (stationDuplication) {
        throw new HttpException(400, `${name} 은 이미 저장되어 있습니다.`);
        return;
      }

      const newStations = [];
      const station = await Station.create({
        name,
        latitude,
        longitude,
      });
      newStations.push(station);
    }
    res.status(201).send(newStations);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /stations:
 *   get:
 *     summary: 모든 역 찾기
 *     responses:
 *       200:
 *         description: 모든 역 찾기 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   name:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                     format: float
 *                   longitude:
 *                     type: number
 *                     format: float
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/', async (req, res, next) => {
  try {
    const allStations = await Station.findAll();
    res.status(200).send(allStations);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /stations/{id}:
 *   get:
 *     summary: 역 아이디로 해당 역 정보 찾기, 로그인 인증 필수, 토큰은 local storage 에 저장 되어 있는 것을 이용
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: 역 위치와 해당 역에 있는 사물함 찾기 성공
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 latitude:
 *                   type: number
 *                   format: float
 *                 longitude:
 *                   type: number
 *                   format: float
 *                 temperature:
 *                   type: number
 *                   format: float
 *                 humidity:
 *                   type: number
 *                   format: float
 *                 lockers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         default: "unoccupied"
 *                       userId:
 *                         type: number
 *                       stationID:
 *                         type: number
 *
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = checkRequiredParameters([id]);
    if (result.validation === false) {
      throw new HttpException(result.statusCode, result.message);
      return;
    }
    const idIsInteger = Number.isInteger(Number(id));
    if (!idIsInteger) {
      throw new HttpException(400, 'id 값은 숫자로 입력해주세요');
    }

    const station = await Station.findOne({
      where: { id },
      attributes: { exclude: ['updatedAt', 'createdAt'] },
    });

    if (!station) {
      throw new HttpException(400, '해당하는 역은 없습니다.');
      return;
    }

    const weatherData = await checkWeather(station);
    const lockers = await Locker.findAll({
      where: { stationId: id },
      attributes: { exclude: ['updatedAt', 'createdAt'] },
    });

    const lockerInfo = [];
    for (let i = 0; i < lockers.length; i++) {
      lockerInfo.push(lockers[i].dataValues);
    }
    const stationMetaData = {
      station: station.dataValues,
      lockerInfo,
      temperature: weatherData.main.temp,
      humidity: weatherData.main.humidity,
    };
    res.status(200).send(stationMetaData);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /stations/{id}:
 *   delete:
 *     summary: 역관련 정보 삭제
 *     description : 입력된 역이름을 이용하여 해당 역과 해당 역과 연결된 라커도 같이 다 제거
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: ture
 *     responses:
 *       204:
 *         description : 역 삭제 성공
 *
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = checkRequiredParameters([id]);
    if (result.validation === false) {
      throw new HttpException(result.statusCode, result.message);
      return;
    }
    const nameValidation = await Station.findOne({
      where: { id },
    });
    if (!nameValidation) {
      throw new HttpException(400, '없는 역이름 입니다.');
    }
    await Locker.destroy({ where: { stationId: nameValidation.id } });
    await Station.destroy({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
module.exports = router;
