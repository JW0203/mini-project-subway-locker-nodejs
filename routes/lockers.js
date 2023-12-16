const { Locker, Station } = require('../models');
const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const HttpException = require('../middleware/HttpException');

/**
 * @swagger
 * /stations/make:
 *   post:
 *     summary: 역에 라커 추가하기
 *     requestBody:
 *       description: 역 이름 과 라커 갯수
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *               n:
 *                 type: integer
 *     responses:
 *       201:
 *         description: 라커 추가 성공
 */

router.post('/make', async (req, res, next) => {
  try {
    const { name, n } = req.body;
    console.log(name);
    const station = await Station.findOne({
      where: { name },
    });
    if (!station) {
      throw new HttpException(400, '해당하는 역은 등록되어 있지 않습니다.'); // 오류
      return;
    }

    await sequelize.transaction(async () => {
      const stationId = station.id;
      for (let i = 0; i < n; i++) {
        const newLocker = await Locker.create({
          stationId,
        });
      }
      res.status(201).send(`${n}개의 라커가 ${name}에 생성되었습니다.`);
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /lockers:
 *   get:
 *     summary: 모든 사물함 검색
 *     description: 모든 역에 있는 사물함 검색
 *     responses:
 *       200:
 *         조회 성공
 */
router.get('/', async (req, res, next) => {
  try {
    const allLockers = await Locker.findAll();
    res.status(200).send(allLockers);
  } catch (err) {
    next();
  }
});

/**
 * @swagger
 * /lockers/{stationName}:
 *   get:
 *     summary: 사물함 정보 조회
 *     description: 해당 역에 있는모든 라커의 정보를 조회한다.
 *     parameters:
 *      - in: path
 *        name: station name
 *        required: true
 *        description :  the name of a station
 *        schema:
 *          type: string
 *
 *     responses:
 *       200:
 *         description: 조회 성공
 */

router.get('/:name', async (req, res, next) => {
  try {
    const name = req.params.name;

    const station = await Station.findOne({
      where: { name },
    });
    if (!station) {
      throw new HttpException(400, `${name}은 없습니다.`);
      return;
    }
    const stationId = station.id;

    const lockers = await Locker.findAll({
      where: {
        stationId,
      },
    });
    res.status(200).send(lockers);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /lockers/use:
 *   patch:
 *     summary: 역에 있는 라커 사용
 *     requestBody:
 *       description: 라커 id, 유저 id, 역 id,
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *               n:
 *                 type: integer
 *     responses:
 *       200:
 *        라커 대여 성공
 *
 */
router.patch('/use', async (req, res, next) => {
  const { id, userInUse } = req.body;
  try {
    const startDate = Date.now();
    await Locker.update(
      {
        userInUse,
        startDate,
      },
      { where: { id } },
    );

    const useLocker = await Locker.findByPk(id);
    res.status(200).send(useLocker);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /lockers/use:
 *   patch:
 *     summary: 역에 있는 라커 사용 종료
 *     requestBody:
 *       description: 라커 id
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               id:
 *                 type: Integer
 *     responses:
 *       200:
 *        라커 사용 종료 요청 성공
 */
router.patch('/end', async (req, res, next) => {
  try {
    const { id } = req.body;
    const endDate = Date.now();
    await Locker.update(
      {
        endDate,
      },
      { where: { id } },
    );
    const endLocker = await Locker.findByPk(id);
    const dateStart = new Date(endLocker['startDate']);
    const dateEnd = new Date(endDate);
    const diffMSec = dateEnd.getTime() - dateStart.getTime();
    const diffHour = Math.round(diffMSec / (60 * 1000));

    res.status(200).send(`사용한 시간은 ${diffHour}분 입니다.`);
  } catch (err) {
    next(err);
  }
});
module.exports = router;
