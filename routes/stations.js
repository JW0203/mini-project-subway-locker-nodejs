require('dotenv').config();
const { Station, Locker } = require('../models');
const express = require('express');
const router = express.Router();
const { authenticateToken, authorityConfirmation, HttpException } = require('../middleware');
const { weatherApi, asyncHandler } = require('../functions');
const { UserAuthority } = require('../models/enums');
const sequelize = require('../config/database');

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
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "서울역"
 *                 latitude:
 *                   type: number
 *                   format: float
 *                   example: 37.528
 *                 longitude:
 *                   type: number
 *                   format: float
 *                   example: 126.9294
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
 */
router.post(
  '/',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN]),
  asyncHandler(async (req, res) => {
    const stations = req.body;
    const newStations = [];
    const requiredKeys = ['name', 'latitude', 'longitude'];

    if (!stations) {
      throw new HttpException(400, '역을 추가하기 위한 데이터(역명, 경도, 위도) 를 입력해주세요.');
    }

    for (const station of stations) {
      if (Object.keys(station).length === 0) {
        throw new HttpException(400, '입력한 데이터가 비어 있습니다.');
      }
      if (typeof station !== 'object' || station === null) {
        throw new HttpException(400, '입력한 데이터의 속성은 objects 이여야 합니다.');
      }

      const stationKeys = Object.keys(station);
      if (!requiredKeys.every((key) => stationKeys.includes(key)) || stationKeys.length !== requiredKeys.length) {
        throw new HttpException(400, 'data의 key 값이 잘 못되었습니다.');
      }

      const { name, latitude, longitude } = station;
      if (typeof name !== 'string') {
        throw new HttpException(400, 'name은 문자로 입력해주세요.');
      }

      if (typeof latitude !== 'number') {
        throw new HttpException(400, 'latitude 는 숫자로 입력해주세요.');
      }
      if (!(-90 < latitude && 90 > latitude)) {
        throw new HttpException(400, 'latitude 는 -90 에서 90 사이의 값을 입력해주세요.');
      }
      if (typeof longitude !== 'number') {
        throw new HttpException(400, 'longitude 는 숫자로 입력해주세요.');
      }
      if (!(-180 < longitude && 180 > longitude)) {
        throw new HttpException(400, 'longitude 는 -180 에서 180 사이의 값을 입력해주세요.');
      }

      const stationDuplication = await Station.findOne({
        where: { name },
      });

      if (stationDuplication) {
        throw new HttpException(422, `${name} 은 이미 저장되어 있습니다.`);
      }

      const newStation = await Station.create({
        name,
        latitude,
        longitude,
      });
      newStations.push(newStation);
    }
    res.status(201).send(newStations);
  }),
);

/**
 * @swagger
 * /stations:
 *   get:
 *     summary: 모든 역을 찾아서 맵에 보여주기
 *     responses:
 *       200:
 *         description: 모든 역 찾기 성공하여 맵에 보여주기
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
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const allStations = await Station.findAll();
    res.status(200).send(allStations);
  }),
);

/**
 * @swagger
 * /stations/{id}:
 *   get:
 *     summary: 역 아이디로 해당 역 정보 찾기
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
 *                       startDateTime:
 *                         type: string
 *                         format: date-time
 *                       endDateTime:
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
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const stationId = Number(req.params.id);

    if (!stationId) {
      throw new HttpException(400, 'id 값을 입력해주세요.');
    }

    if (!Number.isInteger(stationId) || stationId <= 0) {
      throw new HttpException(400, '유효한 stationId 를 숫자로 입력해주세요.');
    }

    const station = await Station.findOne({
      where: { id: stationId },
      attributes: { exclude: ['updatedAt', 'createdAt'] },
    });

    if (!station) {
      throw new HttpException(404, '해당하는 역은 없습니다.');
    }

    const weatherData = await weatherApi(station);
    const lockers = await Locker.findAll({
      where: { stationId },
      attributes: { exclude: ['updatedAt', 'createdAt'] },
    });

    const stationMetaData = {
      station: station.dataValues,
      lockers,
      temperature: weatherData.main.temp,
      humidity: weatherData.main.humidity,
    };
    res.status(200).send(stationMetaData);
  }),
);

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
router.delete(
  '/:id',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN]),
  asyncHandler(async (req, res) => {
    const stationId = Number(req.params.id);

    if (!stationId) {
      throw new HttpException(400, 'id 값을 입력해주세요.');
    }
    if (!Number.isInteger(stationId) || stationId <= 0) {
      throw new HttpException(400, '유효한 stationId 를 숫자로 입력해주세요.');
    }
    const station = await Station.findOne({
      where: { id: stationId },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    if (!station) {
      throw new HttpException(404, '없는 역이름 입니다.');
    }
    await sequelize.transaction(async () => {
      await Locker.destroy({ where: { stationId } });
      await Station.destroy({ where: { id: stationId } });
    });

    res.status(204).send();
  }),
);

/**
 * @swagger
 * /stations/restore/{id}:
 *   post:
 *     summary: 지운 station 과 연결된 lockers 복구
 *     description: 관리자 권한필요, 지워진 station id 를 이용하여 station 과 연결된 locker 복구
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: 삭제된 station id
 *     responses:
 *       201:
 *         description: 삭제된 station locker 성공적으로 복구
 *         content:
 *           application.json:
 *             schema:
 *               properties:
 *                 station:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     name:
 *                       type: string
 *                     latitude:
 *                       type: number
 *                       format: float
 *                     longitude:
 *                       type: number
 *                       format: float
 *                     deletedAt:
 *                       type: string
 *                       default : null
 *                 lockers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       startDateTime:
 *                         type: string
 *                         format: date-time
 *                       endDateTime:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         default: "unoccupied"
 *                       userId:
 *                         type: number
 *                       stationID:
 *                         type: number
 *                       deletedAt:
 *                         type: string
 *                         default: null
 *
 */
router.post(
  '/restore/:id',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN]),
  asyncHandler(async (req, res) => {
    const stationId = Number(req.params.id);
    if (!stationId) {
      throw new HttpException(400, '복구할 station 의 id 를 입력해주세요.');
    }
    if (!Number.isInteger(stationId) || stationId <= 0) {
      throw new HttpException(400, '유효한 stationId 를 숫자로 입력해주세요.');
    }
    const station = await Station.findOne({ where: { id: stationId }, paranoid: false });
    if (!station) {
      throw new HttpException(404, ' 존재하지 않는 station 입니다.');
    }
    if (station.deletedAt === null) {
      throw new HttpException(422, '삭제된 station 이 아닙니다.');
    }

    await Station.restore({ where: { id: stationId } });
    await Locker.restore({ where: { stationId } });

    const restoredStation = await Station.findOne({
      where: { id: stationId },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    const restoredLockers = await Locker.findAll({
      where: { stationId },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    const restoredStationLockers = {
      stations: restoredStation,
      lockers: restoredLockers,
    };
    res.status(200).send(restoredStationLockers);
  }),
);

/**
 * @swagger
 * /stations/{id}:
 *   patch:
 *     summary: 게시물 수정
 *     description: 관리자가 로그인 한 후, 게시물의 아이디를 받고 해당 게시물을 수정
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: 역 아이디
 *     requestBody:
 *       description: 수정하고 싶은 내용에 값 입력
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: 수정 성공, 수정된 역 정보 제공
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 longitude:
 *                   type: number
 *                 latitude:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *
 */

router.patch(
  '/:id',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN]),
  asyncHandler(async (req, res) => {
    const stationId = Number(req.params.id);
    const { name, latitude, longitude } = req.body;
    if (!stationId) {
      throw new HttpException(400, 'id 값을 입력해주세요.');
    }
    if (!Number.isInteger(stationId) || stationId <= 0) {
      throw new HttpException(400, '유효한 stationId 를 숫자로 입력해주세요.');
    }
    if (!name && !latitude && !longitude) {
      throw new HttpException(400, '수정할 내용을 입력해주세요.');
    }
    const station = await Station.findByPk(stationId);
    if (!station) {
      throw new HttpException(404, '존재하지 않는 station 아이디 입니다.');
    }

    if (name && name.replace(/ /g, '') === '') {
      throw new HttpException('name 에 수정할 문자를 입력해주세요.');
    }
    if (latitude && !Number(latitude)) {
      throw new HttpException('latitude 에 숫자를 입력해주세요.');
    }
    if (longitude && !Number(longitude)) {
      throw new HttpException('longitude 에 숫자를 입력해주세요.');
    }

    const updateData = { name, latitude, longitude };
    await Station.update(updateData, { where: { id: stationId } });

    const revisedPost = await Station.findByPk(stationId);
    res.status(200).send(revisedPost);
  }),
);

module.exports = router;
