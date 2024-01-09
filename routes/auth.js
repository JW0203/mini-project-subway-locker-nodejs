require('dotenv').config();
const { User, BlackList } = require('../models');
const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const HttpException = require('../middleware/HttpException');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authenticateToken');

/**
 * @swagger
 * /auth/sign-up:
 *   post:
 *     summary: 회원가입
 *     requestBody:
 *       description: 전달 받은 이메일과 패스워드를 이용하여 유효성을 확인한 후 회원가입 실행
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 id:
 *                   type: number
 *                 email:
 *                   type: string
 *                   format: email
 */

router.post('/sign-up', async (req, res, next) => {
  const specialCharacters = /[\{\}\[\]\/?,;:|\)*~`!^\-+<>\#$%&\\\=\(\'\"]/g; // @. removed
  const emptySpace = /\s/g;
  const startEnglishNumber = /^[0-9,a-zA-Z]/;
  const emailAfterAtPattern = /^([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,5}$/;
  const passwordLengthMin = 8;
  const passwordLengthMax = 15;

  try {
    const { email, password } = req.body;
    const emailAfterAt = email.split('@')[1];
    await sequelize.transaction(async () => {
      const emailDuplicationCheck = await User.findOne({ where: { email } });

      if (emailDuplicationCheck) {
        throw new HttpException(400, '입력하신 이메일은 이미 사용 중입니다.');
        return;
      }

      if (email.match(specialCharacters)) {
        throw new HttpException(400, '입력하신 이메일에 특수문자가 있습니다.');
        return;
      }

      if (email.match(emptySpace)) {
        throw new HttpException(400, '입력하신 이메일에 공백이 있습니다.');
        return;
      }

      if (!email.match(startEnglishNumber)) {
        throw new HttpException(400, '이메일의 시작은 숫자나 영어로 되어야 합니다.');
        return;
      }

      if (!emailAfterAt.match(emailAfterAtPattern)) {
        throw new HttpException(400, '입력한 이메일의 도메인 부분을 다시 확인 해주세요.');
        return;
      }

      if (password.length < passwordLengthMin || password.length > passwordLengthMax) {
        throw new HttpException(400, '비밀번호는 8자리이상 15이하여야 합니다.');
        return;
      }

      if (password.match(emptySpace)) {
        throw new HttpException(400, '비밀번호에 공백이 있습니다.');
        return;
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await User.create({
        email,
        password: hashedPassword,
      });

      const newUser = await User.findOne({
        where: { email },
        attributes: ['id', 'email'],
      });
      res.status(201).send(newUser);
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/sign-in:
 *   post:
 *     summary: 로그인
 *     requestBody:
 *       description: 로그인을 위해 필요한 이메일 주소와 비밀번호 요청
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *
 *     responses:
 *       201:
 *         description: 받은 이메일 주소와 비밀번호 일치, 로그인 성공, access token은 local storage 에 저장
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "jwt-access-token"
 *
 */

router.post('/sign-in', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    await sequelize.transaction(async () => {
      const user = await User.findOne({
        where: { email },
      });

      if (!user) {
        throw new HttpException(400, '입력하신 email은 없습니다.');
        return;
      }

      const passwordValidation = await bcrypt.compare(password, user.password);
      if (!passwordValidation) {
        throw new HttpException(400, '비밀번호가 틀렸습니다.');
        return;
      }

      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: '1d',
      });

      const tokenValidation = await BlackList.findOne({ where: { accessToken } });
      if (tokenValidation) {
        throw new HttpException(400, '토큰이 블랙리스트에 있습니다.');
        return;
      }

      const ondDayTimeStamp = 24 * 60 * 60 * 1000;
      const expiryDate = Date.now() + ondDayTimeStamp;
      await BlackList.create({
        accessToken,
        expiryDate,
      });

      localStorage.setItem('access_token', accessToken);

      res.status(201).send(accessToken);
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/sign-out:
 *   delete:
 *     summary: 로그아웃
 *     requestBody:
 *       description: 로그아웃을 위해 필요한 이메일 주소요청 및 access token 가져오기
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *
 *     responses:
 *       204:
 *         description: 로그아웃 성공 - 받은 이메일 주소와 access token 일치, local storage에 있는 access token 삭제
 */

router.delete('/sign-out', authenticateToken, async (req, res, next) => {
  const id = req.user.id;
  const user = await User.findByPk(id);
  const userEmail = user.email;
  const accessToken = localStorage.getItem('access_token');

  await BlackList.destroy({ where: { accessToken } });
  localStorage.removeItem('access_token');

  res.status(204).send();
});

module.exports = router;
