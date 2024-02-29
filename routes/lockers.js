const { Locker, Station, User, Comment } = require('../models');
const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const { authenticateToken, authorityConfirmation, HttpException } = require('../middleware');
const { LockerStatus, UserAuthority } = require('../models/enums');
const { pagination, asyncHandler } = require('../functions');

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
 *               stationId:
 *                 type: number
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
 *                 startDateTime:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 endDateTime:
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
 *
 */

router.post(
  '/',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN]),
  asyncHandler(async (req, res) => {
    const { stationId, numberLockers } = req.body;

    if (!stationId || !numberLockers) {
      throw new HttpException(400, 'stationId 과 numberLockers 값 둘다 입력해주세요');
    }

    if (!Number.isInteger(stationId) || stationId <= 0) {
      throw new HttpException(400, ' 유효한 stationId 를 숫자로 입력해주세요.');
    }

    if (!Number.isInteger(numberLockers) || numberLockers <= 0) {
      throw new HttpException(400, '유효한 numberLockers를 숫자로 입력해주세요.');
    }

    const station = await Station.findOne({
      where: { id: stationId },
    });
    if (!station) {
      throw new HttpException(404, '해당하는 역은 등록되어 있지 않습니다.');
    }

    let newLockers = [];
    await sequelize.transaction(async () => {
      for (let i = 0; i < numberLockers; i++) {
        const newLocker = await Locker.create({
          stationId,
        });
        newLockers.push(newLocker);
      }

      res.status(201).send(newLockers);
    });
  }),
);

/**
 * @swagger
 * /lockers?limit=number&page=number:
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
 *               type: object
 *               properties:
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     startDateTime:
 *                       type: string
 *                       format: date-time
 *                     endDateTime:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       default: "unoccupied"
 *                     stationId:
 *                       type: number
 *                     userId:
 *                       type: number
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     totalPages:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     offset:
 *                       type: number
 *                     count:
 *                       type: number
 *                     page:
 *                       type: number
 *                       example: 1
 *                     previousPage:
 *                       type: number
 *                       nullable: true
 *                       example: null
 *                     nextPage:
 *                       type: number
 *                       nullable: true
 *                       example: 2
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit) || 5;

    const result = await pagination(page, limit, Locker);

    res.status(200).send(result);
  }),
);

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
 *                 startDateTime:
 *                   type: string
 *                   format: date-time
 *                 endDateTime:
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

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const lockerId = Number(req.params.id);
    if (!lockerId) {
      throw new HttpException(400, 'id 값을 입력해주세요.');
    }
    if (!Number.isInteger(lockerId) || lockerId <= 0) {
      throw new HttpException(400, '유효한 lockerId 를 숫자로 입력해주세요.');
    }

    const locker = await Locker.findOne({
      where: { id: lockerId },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    if (!locker) {
      throw new HttpException(404, '없는 사물함 아이디 입니다.');
    }

    res.status(200).send(locker);
  }),
);

/**
 * @swagger
 * /lockers/rental:
 *   post:
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
 *                 startDateTime:
 *                   type: string
 *                   format: date-time
 *                 endDateTime:
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
router.post(
  '/rental',
  authenticateToken,
  authorityConfirmation([UserAuthority.USER]),
  asyncHandler(async (req, res) => {
    const { lockerId } = req.body;
    const userId = req.user.id;

    if (!lockerId) {
      throw new HttpException(400, 'id 값을 입력해주세요.');
    }
    if (!Number.isInteger(lockerId) || lockerId <= 0) {
      throw new HttpException(400, '유효한 lockerId 를 숫자로 입력해주세요.');
    }

    const locker = await Locker.findByPk(lockerId);
    if (!locker) {
      throw new HttpException(404, `락커 ${lockerId}는 없습니다. `);
    }

    if (locker.userId === userId) {
      throw new HttpException(422, '선택하신 사물함은 이미 회원님이 사용중 입니다.');
    }

    if (locker.status === LockerStatus.OCCUPIED) {
      throw new HttpException(422, '선택하신 사물함은 다른 회원이 사용중 입니다.');
    }
    if (locker.status === LockerStatus.UNDER_MANAGEMENT) {
      throw new HttpException(422, '선택하신 사물함은 관리중 입니다.');
    }

    const startDateTime = Date.now();
    await sequelize.transaction(async () => {
      await Locker.update(
        {
          userId,
          startDateTime,
          status: LockerStatus.OCCUPIED,
        },
        { where: { id: lockerId } },
      );
    });

    const useLocker = await Locker.findByPk(lockerId);
    res.status(200).send(useLocker);
  }),
);

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
 *                 startDateTime:
 *                   type: string
 *                   format: date-time
 *                 endDateTime:
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
router.patch(
  '/return',
  authenticateToken,
  authorityConfirmation([UserAuthority.USER]),
  asyncHandler(async (req, res) => {
    const { id, endDateTime, payment } = req.body;
    const user = req.user;
    if (!id || !endDateTime || !payment) {
      throw new HttpException(400, 'id, endDateTime, payment 값을 모두 입력해주세요.');
    }

    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException(400, '유효한 lockerId 를 숫자로 입력해주세요.');
    }

    const date = new Date(endDateTime);
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new HttpException(400, '유효한 날짜와 시간을 입력해주세요.');
    }

    const locker = await Locker.findByPk(id);
    if (!locker) {
      throw new HttpException(404, `락커 ${id} 는 없습니다.`);
    }

    if (locker.userId !== user.id) {
      throw new HttpException(403, '해당 유저가 사용하고 있는 락커가 아닙니다.');
    }
    if (locker.status === LockerStatus.UNOCCUPIED) {
      throw new HttpException(422, '비어 있는 락커 입니다.');
    }

    await sequelize.transaction(async () => {
      await Locker.update(
        {
          endDateTime,
          status: LockerStatus.UNOCCUPIED,
          userId: null,
        },
        { where: { id, userId: user.id } },
      );

      const updatedLocker = await Locker.findOne({
        where: { id },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });

      res.status(200).send(updatedLocker);
    });
  }),
);

/**
 * @swagger
 * /lockers/management:
 *   patch:
 *     summary: 라커 상태 관리
 *     requestBody:
 *       description: 관리자가 로그인 하여 라커의 상태를 변경 및 관리
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               id:
 *                 type: number
 *     responses:
 *       200:
 *         description: 수정 요청 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 startDateTime:
 *                   type: string
 *                   format: date-time
 *                 endDateTime:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                   example: "unoccupied"
 *                 isMyLocker:
 *                   type: boolean
 *                   example: false
 *                 stationId:
 *                   type: number
 *                 userId:
 *                   type: number
 *
 */
router.patch(
  '/management',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN]),
  asyncHandler(async (req, res) => {
    const { lockerId, status } = req.body;
    console.log(typeof lockerId);
    if (!lockerId || !status) {
      throw new HttpException(400, 'lockerId 와 status 값을 모두 입력해주세요.');
    }
    if (!Number.isInteger(lockerId) || lockerId <= 0) {
      throw new HttpException(400, '유효한 lockerId 를 숫자로 입력해주세요.');
    }

    if (!Object.values(LockerStatus).includes(status)) {
      throw new HttpException(400, 'status 값은 다음과 같은 값만 입력해주세요. unoccupied, occupied, under management');
    }
    const locker = await Locker.findByPk(lockerId);
    if (!locker) {
      throw new HttpException(404, `락커 ${lockerId} 는 없습니다.`);
    }

    await sequelize.transaction(async () => {
      await Locker.update(
        {
          status,
        },
        { where: { id: lockerId } },
      );

      const updatedLocker = await Locker.findOne({
        where: { id: lockerId },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });

      res.status(200).send(updatedLocker);
    });
  }),
);

/**
 * @swagger
 * /lockers/{id}:
 *   delete:
 *     summary: 사물함 삭제
 *     description: 관리자 권한필요, 사물함 id 를 이용하여 삭제
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: ture
 *     responses:
 *       204:
 *         description: 삭제성공
 *
 *
 */
router.delete(
  '/:id',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN]),
  asyncHandler(async (req, res) => {
    const lockerId = Number(req.params.id);

    if (!lockerId) {
      throw new HttpException(400, 'id 값을 입력해주세요.');
    }
    if (!Number.isInteger(lockerId) || lockerId <= 0) {
      throw new HttpException(400, '유효한 lockerId 를 숫자로 입력해주세요.');
    }

    const locker = await Locker.findByPk(lockerId);
    if (!locker) {
      throw new HttpException(404, '주어진 id 값을 가지는 게시물이 없습니다.');
    }
    await Locker.destroy({ where: { id: lockerId } });
    res.status(204).send();
  }),
);

/**
 * @swagger
 * /lockers/restore/{id}:
 *   post:
 *     summary: 지운 locker 복구
 *     description: 관리자 권한필요, 지워진 locker id 를 이용하여 복구
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: 삭제된 locker id
 *     responses:
 *       201:
 *         description: 삭제된 locker 성공적으로 복구
 *         content:
 *           application.json:
 *             schema:
 *               properties:
 *                 id:
 *                   type: number
 *                 startDateTime:
 *                   type: string
 *                   format: date-time
 *                 endDateTime:
 *                   type: string
 *                   format: date-time
 *                 stationId:
 *                   type: number
 *                 userId:
 *                   type: number
 *                 status:
 *                   type: string
 *                   default: "unoccupied"
 *                 isMyLocker:
 *                   type: boolean
 *                   default: false
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 deletedAt:
 *                   type: string
 *                   format: date-time
 *                   default: null
 *
 */
router.post(
  '/restore/:id',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN]),
  asyncHandler(async (req, res) => {
    const lockerId = Number(req.params.id);

    if (!lockerId) {
      throw new HttpException(400, '복구할 포스트의 id 를 입력해주세요.');
    }

    if (!Number.isInteger(lockerId) || lockerId <= 0) {
      throw new HttpException(400, '유효한 lockerId 를 숫자로 입력해주세요.');
    }

    const locker = await Locker.findOne({
      where: { id: lockerId },
    });
    if (locker) {
      throw new HttpException(422, '삭제된 locker 가 아닙니다.');
    }
    await Locker.restore({ where: { id: lockerId } });

    const restoredLocker = await Locker.findOne({
      where: { id: lockerId },
    });
    res.status(200).send(restoredLocker);
  }),
);

module.exports = router;
