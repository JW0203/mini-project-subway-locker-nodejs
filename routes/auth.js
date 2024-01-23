require('dotenv').config();
const { User, BlackList, Admin } = require('../models');
const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const HttpException = require('../middleware/HttpException');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authenticateToken');
const UserAuthority = require('../models/enums/UserAuthority');
const { signUpEmailPasswordValidation } = require('../functions');
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
 *                 authority:
 *                   type: string
 *                   enum: ["user", "admin"]
 *                   default: "user"
 */

router.post('/sign-up', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new HttpException(400, 'email 과 password 둘다 입력해주세요.');
      return;
    }

    await sequelize.transaction(async () => {
      const result = await signUpEmailPasswordValidation(email, password);
      if (result.statusCode === 400) {
        throw new HttpException(result.statusCode, result.message);
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await User.create({
        email,
        password: hashedPassword,
        authority: UserAuthority.USER,
      });

      const newUser = await User.findOne({
        where: { email },
        attributes: ['id', 'email', 'authority'],
      });
      res.status(201).send(newUser);
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /auth/admin/sign-up:
 *   post:
 *     summary: 회원가입
 *     requestBody:
 *       description: .env에 저장된 이메일 비번을 먼저 확인하고, 전달 받은 이메일과 패스워드를 이용하여 유효성을 확인한 후 회원가입 실행
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
 *                 authority:
 *                   type: string
 *                   enum: ["user", "admin"]
 *                   default: "admin"
 *
 */

router.post('/admin/sign-up', async (req, res, next) => {
  try {
    if (!process.env.DEFAULT_MASATER_EMAIL) {
      throw new HttpException(400, '마스터 이메일을 입력해주세요');
      return;
    }
    if (!process.env.DEFAULT_MASTER_PASSWORD) {
      throw new HttpException(400, '마스터 비밀번호를 입력해주세요');
      return;
    }
    const { email, password } = req.body;
    if (!email || !password) {
      throw new HttpException(400, 'email 과 password 둘다 입력해주세요.');
      return;
    }

    await sequelize.transaction(async () => {
      const result = await signUpEmailPasswordValidation(email, password);
      if (result.statusCode === 400) {
        throw new HttpException(result.statusCode, result.message);
        return;
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await Admin.create({
        email,
        password: hashedPassword,
        authority: UserAuthority.ADMIN,
      });

      const newAdmin = await Admin.findOne({
        where: { email },
        attributes: ['id', 'email', 'authority'],
      });
      res.status(201).send(newAdmin);
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
    if (!email || !password) {
      throw new HttpException(400, 'email 과 password 를 입렵 해주세요.');
      return;
    }
    await sequelize.transaction(async () => {
      const user = await User.findOne({
        where: { email },
      });

      const admin = await Admin.findOne({
        where: { email },
      });

      if (!user && !admin) {
        throw new HttpException(400, '입력하신 email은 없습니다.');
        return;
      }

      const signIn = user || admin;

      const passwordValidation = await bcrypt.compare(password, signIn.password);
      if (!passwordValidation) {
        throw new HttpException(400, '비밀번호가 틀렸습니다.');
        return;
      }

      const accessToken = jwt.sign({ id: signIn.id }, process.env.JWT_SECRET_KEY, {
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

      res.status(201).send({ accessToken, authority: signIn.authority });
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
  const accessToken = req.token;

  await BlackList.destroy({ where: { accessToken } });

  res.status(204).send();
});

module.exports = router;
