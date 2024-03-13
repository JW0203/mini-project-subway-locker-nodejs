require('dotenv').config();
const { User, BlackList, Admin } = require('../models');
const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken, HttpException } = require('../middleware');
const { UserAuthority } = require('../models/enums');
const { signUpEmailPasswordValidation, asyncHandler } = require('../functions');

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

router.post(
  '/sign-up',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new HttpException(400, 'email 과 password 를 입력 해주세요.');
    }
    console.log('-----password type------');
    console.log(typeof password);
    console.log('*************************');
    await sequelize.transaction(async () => {
      const isValidEmailPassword = await signUpEmailPasswordValidation(email, password);
      if (!isValidEmailPassword.validation) {
        throw new HttpException(isValidEmailPassword.statusCode, isValidEmailPassword.message);
      }
      const saltRounds = parseInt(process.env.SALT_ROUNDS);
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
  }),
);

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

router.post(
  '/admin/sign-up',
  asyncHandler(async (req, res) => {
    if (!process.env.DEFAULT_MASATER_EMAIL) {
      throw new HttpException(400, '마스터 이메일을 입력 해주세요');
    }
    if (!process.env.DEFAULT_MASTER_PASSWORD) {
      throw new HttpException(400, '마스터 비밀번호를 입력 해주세요');
    }
    const { email, password } = req.body;
    if (!email || !password) {
      throw new HttpException(400, 'email 과 password 를 입력 해주세요.');
    }

    await sequelize.transaction(async () => {
      const isValidEmailPassword = await signUpEmailPasswordValidation(email, password);
      if (!isValidEmailPassword.validation) {
        throw new HttpException(isValidEmailPassword.statusCode, isValidEmailPassword.message);
      }

      const hashedPassword = await bcrypt.hash(password, process.env.SALT_ROUNDS);

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
  }),
);

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

router.post(
  '/sign-in',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new HttpException(400, 'email 과 password 를 입력 해주세요.');
    }
    await sequelize.transaction(async () => {
      const user = await User.findOne({
        where: { email },
      });

      const admin = await Admin.findOne({
        where: { email },
      });

      if (!user && !admin) {
        throw new HttpException(401, '입력하신 email은 없습니다.');
      }
      const signIn = user || admin;

      const passwordValidation = await bcrypt.compare(password, signIn.password);
      if (!passwordValidation) {
        throw new HttpException(401, '비밀번호가 틀렸습니다.');
      }

      const accessToken = jwt.sign(
        {
          id: signIn.id,
          email: signIn.email,
          authority: signIn.authority,
        },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: '1d',
        },
      );

      const ondDayTimeStamp = 24 * 60 * 60 * 1000;
      const expiryDate = Date.now() + ondDayTimeStamp;
      await BlackList.create({
        accessToken,
        expiryDate,
      });

      res.status(201).send({ accessToken, authority: signIn.authority });
    });
  }),
);

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

router.delete(
  '/sign-out',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const autherHeader = req.headers.authorization;
    const accessToken = autherHeader && autherHeader.split(' ')[1];

    if (!accessToken) {
      throw new HttpException(401, '헤더에 토큰이 없습니다.');
    }

    res.status(204).send();
  }),
);

module.exports = router;
