const { Locker, Station, User } = require('../models');
const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const HttpException = require('../middleware/HttpException');
const authenticateToken = require('../middleware/authenticateToken');

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

router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const foundLocker = await Locker.findByPk(id);

    if (!foundLocker) {
      throw new HttpException(400, '없는 사물함 아이디 입니다.');
      return;
    }

    res.status(200).send(foundLocker);
  } catch (err) {
    next();
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
router.patch('/use', authenticateToken, async (req, res, next) => {
  const { id } = req.body;
  const userId = req.user.id;
  try {
    const idValidation = await Locker.findByPk(id);
    if (!idValidation) {
      throw new HttpException(400, `락커 ${id}는 없습니다. `);
      return;
    }

    const userValidation = await User.findByPk(userId);
    if (!userValidation) {
      throw new HttpException(400, '존재하지 않는 유저입니다.');
      return;
    }

    const startDate = Date.now();
    await Locker.update(
      {
        userId,
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
 * /lockers/end:
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
    const idValidation = await Locker.findByPk(id);
    if (!idValidation) {
      throw new HttpException(400, `락커 ${id}는 없습니다.`);
      return;
    }

    if (!idValidation.userId) {
      throw new HttpException(400, '비어 있는 락커 입니다.');
      return;
    }
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

/**
 * @swagger
 * locker/reset:
 *   patch:
 *     summary: 결제가 확인되면 사물함 초기화
 *     requestBody:
 *       description: 결제여부, 라커 id
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               payment:
 *                 type: boolean
 *               id:
 *                 type: integer
 *     responses:
 *       200:
 *        라커 초기화 성공
 */

router.patch('/reset', async (req, res, next) => {
  try {
    const { payment, id } = req.body;

    const idValidation = await Locker.findByPk(id);
    if (!idValidation) {
      throw new HttpException(400, `락커 ${id}는 없습니다.`);
      return;
    }

    if (!idValidation.userId) {
      throw new HttpException(400, '비어 있는 락커 입니다.');
      return;
    }
    if (payment === false) {
      throw new HttpException(400, `사물함 ${id}의 사용료를 결제해주세요`);
      return;
    }

    await Locker.update(
      {
        userId: null,
        startDate: null,
        endDate: null,
      },
      { where: { id } },
    );
    const resetLocker = await Locker.findByPk(id);
    res.status(200).send(resetLocker);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
