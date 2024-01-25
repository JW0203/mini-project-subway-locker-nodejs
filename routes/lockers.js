const { Locker, Station, User, Comment } = require('../models');
const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const HttpException = require('../middleware/HttpException');
const { authenticateToken, authorityConfirmation } = require('../middleware');
const { LockerStatus, UserAurhority } = require('../models/enums');
const { checkRequiredParameters, pagination } = require('../functions');
const UserAuthority = require('../models/enums/UserAuthority');

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

router.post('/', authenticateToken, authorityConfirmation(UserAuthority.ADMIN), async (req, res, next) => {
  try {
    const { stationName, numberLockers } = req.body;
    if (!stationName || !numberLockers) {
      throw new HttpException(400, 'stationName 과 numberLockers 값 둘다 입력해주세요');
      return;
    }

    if (typeof stationName !== 'string') {
      throw new HttpException(400, 'stationName 은 문자로 입력해주세요.');
      return;
    }

    if (stationName.replace(/ /g) === '') {
      throw new HttpException(400, 'stationName 은 빈공간 일수 없습니다.');
      return;
    }

    if (!Number.isInteger(numberLockers)) {
      throw new HttpException(400, 'numberLockers 는 숫자로 입력해주세요.');
      return;
    }

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

      res.status(201).send(newLockers);
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /lockers/?limit=number&page=number:
 *   get:
 *     summary: 모든 사물함 찾기
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: 페이지당 보여줄 라커의 수
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: 원하는 페이지 번호
 *
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
    const page = req.query.page;
    const limit = Number(req.query.limit) || 5;
    if (!page || !limit) {
      throw new HttpException(400, 'page 와 limit 값을 모두 입력해주세요.');
      return;
    }
    if (!Number.isInteger(page)) {
      throw new HttpException(400, 'page 값은 숫자를 입력해주세요.');
      return;
    }

    if (!Number.isInteger(limit)) {
      throw new HttpException(400, 'limit 값은 숫자를 입력해주세요.');
      return;
    }

    const { offset, totalPages, count } = await pagination(page, limit);
    if (page < 1 || page > totalPages) {
      throw new HttpException(400, `page 범위는 1부터 ${totalPages} 입니다.`);
      return;
    }

    const lockers = await Locker.findAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const items = [];
    for (let i = 0; i < lockers.length; i++) {
      items.push(lockers[i].dataValues);
    }

    // let nextPage = (page+1< totalPages)? page +1 : null;
    let nextPage;
    if (page + 1 < totalPages) {
      nextPage = page + 1;
    } else {
      nextPage = null;
    }

    let previousPage;
    if (page - 1 > 0) {
      previousPage = page - 1;
    } else {
      previousPage = null;
    }

    const metadata = {
      totalPages,
      limit,
      offset,
      count,
      previousPage,
      page,
      nextPage,
    };

    const paginationInfo = {
      items,
      metadata,
    };
    res.status(200).send(paginationInfo);
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
    if (!id) {
      throw new HttpException(400, 'id 값을 입력해주세요.');
      return;
    }
    if (!Number.isInteger(id)) {
      throw new HttpException(400, 'id 값은 숫자로 입력해주세요.');
      return;
    }

    const foundLocker = await Locker.findOne({
      where: { id },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
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
 * /lockers:
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
router.patch('/', authenticateToken, authorityConfirmation(UserAuthority.USER), async (req, res, next) => {
  try {
    const { id } = req.body;
    const userId = req.user.id;
    console.log(userId);

    if (!id) {
      throw new HttpException(400, 'id 값을 입력해주세요.');
      return;
    }
    if (!Number.isInteger(id)) {
      throw new HttpException(400, 'id 값은 정수로 입력해주세요.');
      return;
    }

    const locker = await Locker.findByPk(id);
    if (!locker) {
      throw new HttpException(400, `락커 ${id}는 없습니다. `);
      return;
    }

    if (locker.userId === userId) {
      throw new HttpException(400, '선택하신 사물함은 이미 회원님이 사용중 입니다.');
      return;
    }

    if (locker.status === LockerStatus.OCCUPIED) {
      throw new HttpException(400, '선택하신 사물함은 다른 회원이 사용중 입니다.');
      return;
    }
    if (locker.status === LockerStatus.UNDER_MANAGEMENT) {
      throw new HttpException(400, '선택하신 사물함은 관리중 입니다.');
      return;
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
 * /lockers/return:
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
router.patch('/return', authenticateToken, authorityConfirmation(UserAuthority.BOTH), async (req, res, next) => {
  try {
    const { id, endDateTime, payment } = req.body;
    const user = req.user;
    if (!id || !endDateTime || !payment) {
      throw new HttpException(400, 'id, endDateTime, payment 값을 모두 입력해주세요.');
      return;
    }

    if (!Number.isInteger(id)) {
      throw new HttpException(400, 'id 값은 숫자를 입력해주세요요');
      return;
    }

    if (isNaN(new Date(endDateTime)) === true) {
      throw new HttpException(400, '다음과 같은 형식으로 날짜와 시간을 입력해주세요. YY-MM-DD HH:MM:SS');
      return;
    }

    const locker = await Locker.findByPk(id);
    if (!locker) {
      throw new HttpException(400, `락커 ${id} 는 없습니다.`);
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

    await sequelize.transaction(async () => {
      await Locker.update(
        {
          endDateTime,
          status: LockerStatus.UNOCCUPIED,
        },
        { where: { id } },
      );
      // const updatedLocker = await Locker.findOne({
      //   where: { id },
      // });
      // await updatedLocker.update(
      //   {
      //     startDateTime: null,
      //     endDateTime: null,
      //     status: LockerStatus.UNOCCUPIED,
      //     userId: null,
      //   },
      //   { where: { id } },
      // );

      const updatedLocker = await Locker.findOne({
        where: { id },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });

      // const dateStart = new Date(Locker.dataValues.startDateTime);
      // const dateEnd = new Date(endDateTime);
      // const diffMSec = dateEnd.getTime() - dateStart.getTime();
      // const totalUsedTime = Math.round(diffMSec / 1000 / 60);

      res.status(200).send(updatedLocker);
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
