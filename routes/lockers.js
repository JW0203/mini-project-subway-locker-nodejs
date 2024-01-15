const { Locker, Station, User } = require('../models');
const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const HttpException = require('../middleware/HttpException');
const authenticateToken = require('../middleware/authenticateToken');
const LockerStatus = require('../models/enums/LockerStatus');

/**
 * @swagger
 * /lockers:
 *   post:
 *     summary: 역에 라커 추가하기
 *     requestBody:
 *       description: 역 이름 과 라커 갯수
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               stationName:
 *                 type: string
 *               numberLockers:
 *                 type: number
 *     responses:
 *       201:
 *         description: 라커 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               nullable: true
 *               properties:
 *                 status:
 *                   type: string
 *                   default: "unoccupied"
 *                 id:
 *                   type: number
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 userId:
 *                   type: number
 *                   nullable: true
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 stationId:
 *                   type: number
 *                   nullable: true
 *
 */

router.post('/', async (req, res, next) => {
  try {
    const { stationName, numberLockers } = req.body;
    const station = await Station.findOne({
      where: { name: stationName },
    });
    if (!station) {
      throw new HttpException(400, '해당하는 역은 등록되어 있지 않습니다.'); // 오류
      return;
    }

    let newLockers = [];
    await sequelize.transaction(async () => {
      const stationId = station.id;
      for (let i = 0; i < numberLockers; i++) {
        const newLocker = await Locker.create({
          stationId,
        });
        newLockers.push(newLocker);
      }
      // res.status(201).send(`${n}개의 라커가 ${name}에 생성되었습니다.`);
      res.status(201).send(newLockers);
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /lockers:
 *   get:
 *     summary: 모든 사물함 찾기
 *     responses:
 *       200:
 *         description: 모든 사물함 찾기 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   startDate:
 *                     type: string
 *                     format: date-time
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                     default: "unoccupied"
 *                   stationId:
 *                     type: number
 *                   userId:
 *                     type: number
 *
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
 * /lockers/{id}:
 *   get:
 *     summary: 사물함 검색
 *     description: 사물함 아이디를 입력해서 해당 사물함 정보 검색
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *     responses:
 *       200:
 *         description: 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                   default: "unoccupied"
 *                 stationId:
 *                   type: number
 *                 userId:
 *                   type: number
 *
 */

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
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
 *     summary: 로그인한 유저가 선택한 라커 대여
 *     requestBody:
 *       description: 유저가 선택한 락커의 id 를 바디에서 획득, 유저의 아이디는 는 localstorage 에 있는 토큰을 이용하여 인증 후 req.user 에서 획득,
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               id:
 *                 type: number
 *     responses:
 *       200:
 *         description: 라커 대여 요청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   example: null
 *                 status:
 *                   type: string
 *                   example: "occupied"
 *                 stationId:
 *                   type: number
 *                 userId:
 *                   type: number
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

    if (idValidation.status === LockerStatus.OCCUPIED) {
      throw new HttpException(400, '선택하신 사물함은 다른 회원이 사용중 입니다.');
      return;
    }

    if (idValidation.status === LockerStatus.UNDER_MANAGEMENT) {
      throw new HttpException(400, '선택하신 사물함은 관리중 입니다.');
      return;
    }

    const userValidation = await User.findByPk(userId);
    if (!userValidation) {
      throw new HttpException(400, '존재하지 않는 유저입니다.');
      return;
    }

    if (userId === idValidation.userId) {
      throw new HttpException(400, '선택하신 사물함은 회원님이 이미 사용중입니다.');
    }
    const startDateTime = Date.now();
    await Locker.update(
      {
        userId,
        startDateTime,
        status: LockerStatus.OCCUPIED,
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
 * /lockers/end-use:
 *   patch:
 *     summary: 라커 사용 종료
 *     requestBody:
 *       description: 유저가 사용중인 라커 id를 이용하여 사용종료하고 사용한 시간을 전송
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               id:
 *                 type: number
 *     responses:
 *       200:
 *         description: 사용종료 요청 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                   example: "occupied"
 *                 stationId:
 *                   type: number
 *                 userId:
 *                   type: number
 *                 totalUsedTime:
 *                   type: string
 *                   example: "총 사용한 시간은 30분 입니다."
 *
 */
router.patch('/end-use', authenticateToken, async (req, res, next) => {
  try {
    const { id, endDateTime, payment } = req.body;
    const user = req.user;

    if (!id || !endDateTime || !payment) {
      throw new HttpException(400, '모든 정보를 body에 입력해주세요');
      return;
    }

    if (typeof Number(id) !== 'number') {
      throw new HttpException(400, 'id 값은 숫자를 입력해주세요요');
      return;
    }

    if (isNaN(new Date(endDateTime)) === true) {
      throw new HttpException(400, '다음과 같은 형식으로 날짜와 시간을 입력해주세요. YY-MM-DD HH:MM:SS');
      return;
    }

    const locker = await Locker.findByPk(id);
    if (!locker) {
      throw new HttpException(400, `락커 ${id}는 없습니다.`);
      return;
    }

    if (locker.userId !== user.id) {
      throw new HttpException(400, '해당 유저가 사용하고 있는 락커가 아닙니다.');
      return;
    }
    if (locker.status === LockerStatus.UNOCCUPIED) {
      throw new HttpException(400, '비어 있는 락커 입니다.');
      return;
    }

    if (payment === false) {
      throw new HttpException(400, '결제 여부를 다시 확인해 주세요');
      return;
    }
    await sequelize.transaction(async () => {
      await Locker.update(
        {
          endDateTime,
        },
        { where: { id } },
      );
      const updatedLocker = await Locker.findOne({
        where: { id },
      });
      await updatedLocker.update(
        {
          startDateTime: null,
          endDateTime: null,
          status: LockerStatus.UNOCCUPIED,
          userId: null,
        },
        { where: { id } },
      );

      const resetedLocker = await Locker.findOne({
        where: { id },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });

      // const dateStart = new Date(Locker.dataValues.startDateTime);
      // const dateEnd = new Date(endDateTime);
      // const diffMSec = dateEnd.getTime() - dateStart.getTime();
      // const totalUsedTime = Math.round(diffMSec / 1000 / 60);

      res.status(200).send(resetedLocker);
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /lockers/reset:
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
 *        description: 라커 초기화 성공
 *        content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   example: null
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   example: null
 *                 status:
 *                   type: string
 *                   example: "unoccupied"
 *                 stationId:
 *                   type: number
 *                 userId:
 *                   type: number
 *                   nullable: true
 *                   example: null
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
        status: LockerStatus.UNOCCUPIED,
      },
      { where: { id } },
    );
    const resetLocker = await Locker.findOne({
      where: { id },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    res.status(200).send(resetLocker);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
