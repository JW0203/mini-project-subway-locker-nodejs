const express = require('express');
const router = express.Router();
const { authenticateToken, authorityConfirmation, HttpException } = require('../middleware');
const { User, Locker, Station } = require('../models');
const { asyncHandler } = require('../functions');
const { UserAuthority } = require('../models/enums');

/**
 * @swagger
 * /users/mine:
 *   get:
 *     summary: 로그인 중인 유저가 사물함 정보 조회
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 id:
 *                   type: number
 *                 email:
 *                   type: string
 *                   format: email
 *                 authority:
 *                   type : string
 *                   enum: [user, admin]
 *                 locker:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       startDateTime:
 *                         type: string
 *                         format: date-time
 *                       statusTime:
 *                         type: string
 *                         default: "occupied"
 *                       stationId:
 *                         type: number
 *                       userId:
 *                         type: number
 */
router.get(
  '/mine',
  authenticateToken,
  authorityConfirmation([UserAuthority.USER]),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    if (!userId) {
      throw new HttpException(400, 'id 값을 입력해주세요.');
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new HttpException(400, '유효한 user id 를 숫자로 입력해주세요.');
    }
    const user = await User.findOne({
      where: { id: userId },
      attributes: ['id', 'email'],
    });
    if (!user) {
      throw new HttpException(404, '없는 유저 입니다.');
    }

    const userLocker = await Locker.findAll({
      where: { userId },
      attributes: ['id', 'startDateTime', 'status', 'stationId', 'userId'],
    });

    let userLockerInfo = [];
    if (userLocker) {
      for (let i = 0; i < userLocker.length; i++) {
        let stationId = userLocker[i].dataValues.stationId;
        const station = await Station.findOne({ where: { id: stationId } });
        const stationName = station.dataValues.name;
        const data = {
          ...userLocker[i].dataValues,
          stationName,
        };
        userLockerInfo.push(data);
      }
    }
    res.status(200).send(userLockerInfo);
  }),
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: 유저 아이디로 유저 정보 및 사용 중인 사물함 정보 조회
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 id:
 *                   type: number
 *                 email:
 *                   type: string
 *                   format: email
 *                 authority:
 *                   type : string
 *                   enum: [user, admin]
 *                 locker:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       startDateTime:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         default: "occupied"
 *                       stationId:
 *                         type: number
 *                       userId:
 *                         type: number
 */
router.get(
  '/:id',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN]),
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    if (!userId) {
      throw new HttpException(400, '유저의 id 값을 입력해주세요.');
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new HttpException(400, '유효한 유저의 id 를 숫자로 입력해주세요.');
    }
    const user = await User.findOne({
      where: { id: userId },
      attributes: ['id', 'email'],
    });
    if (!user) {
      throw new HttpException(404, '없는 유저 입니다.');
    }

    const userLockers = await Locker.findAll({
      where: { userId },
      attributes: ['id', 'startDateTime', 'status', 'stationId', 'userId'],
    });

    let userLockerInfo = [];
    if (userLockers) {
      for (const userLocker of userLockers) {
        userLockerInfo.push(userLocker.dataValues);
      }
      user.dataValues.locker = userLockerInfo;
    }
    res.status(200).send(user);
  }),
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: 유저 삭제
 *     description: 유저 아이디를 이용하여 삭제
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
 */

router.delete(
  '/:id?',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN, UserAuthority.USER]),
  asyncHandler(async (req, res) => {
    const { user } = req;
    // delete own account
    if (user.authority === UserAuthority.USER) {
      const id = Number(user.id);
      await User.destroy({ where: { id } });
      res.status(204).send();
    }

    // admin
    if (user.authority !== UserAuthority.ADMIN) {
      throw new HttpException(403, '권한이 없습니다.');
    }
    const userId = Number(req.params.id);
    if (!userId) {
      throw new HttpException(400, '삭제할 user 의 id 를 적어주세요.');
    }
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new HttpException(400, '유효한 user id를 숫자로 입력해주세요.');
    }

    const deleteUser = await User.findOne({ where: { id: userId } });
    if (!deleteUser) {
      throw new HttpException(404, '삭제할 user 가 없습니다.');
    }
    await User.destroy({ where: { id: userId } });
    res.status(204).send();
  }),
);

/**
 * @swagger
 * /users/{id}:
 *   post:
 *     summary: 지운 user 복구
 *     description: 관리자 권한필요, 지워진 user id 를 이용하여 복구
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: 삭제된 user id
 *     responses:
 *       201:
 *         description: 삭제된 user 성공적으로 복구
 *         content:
 *           application.json:
 *             schema:
 *               properties:
 *                 id:
 *                   type: number
 *                 email:
 *                   type: string
 *                   format: email
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 deletedAt:
 *                   type: string
 *                   format: date-time
 *                   default: null
 *
 */

router.post(
  '/:id',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN]),
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    if (!userId) {
      throw new HttpException(400, '복구할 user 의 id 를 입력해주세요.');
    }
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new HttpException(400, ' 유효한 user id 를 숫자로 입력해주세요.');
    }
    const user = await User.findOne({ where: { id: userId } });
    if (user) {
      throw new HttpException(409, '삭제된 user 가 아닙니다.');
    }

    await User.restore({ where: { id: userId } });
    const restoredUser = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ['createadAt', 'updatedAt', 'password'] },
    });
    res.status(201).send(restoredUser);
  }),
);
module.exports = router;
