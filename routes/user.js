const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');

const { User, Locker } = require('../models');
const HttpException = require('../middleware/HttpException');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: users/유저 정보 조회
 *     description: 모든 유저 정보를 조회한다.
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: Integer
 *                    description: The user's pk
 *                  email:
 *                    type: String
 *                    description: user's sigin-in id
 *
 */

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const id = req.user.id;
    const foundUser = await User.findOne({
      where: { id },
      attributes: ['id', 'email', 'createdAt'],
    });
    res.status(200).send(foundUser);
  } catch (err) {
    next();
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: 유저 아이디로 유저 정보 및 사용 중인 사물함 정보 조회
 *     parameters:
 *       - in: path
 *         name: user id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: 조회 성공
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findOne({
      where: { id },
      attributes: ['id', 'email'],
      include: [
        {
          model: Locker,
          where: { userId: id },
        },
      ],
    });
    if (!user) {
      throw new HttpException(400, '없는 유저 입니다.');
      return;
    }

    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
