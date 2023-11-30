const User = require('../models');
const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const {Op} = require('sequelize');


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
 *               id:
 *                 type: integer
 *                 description: 유저의 pk 값
 *               email:
 *                 type: string
 *                 description: 유저 로그인 아이디인 이메일주소
 *               password:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 15
 *                 description: 유저 로그인 비밀번호
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 email:
 *                   type: string
 *                   description: 가입된 이메일주소
 *                 createdAt:
 *                   type:  date-time
 *                   description: 가입한 날짜
 */

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
 *               password:
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: 받은 이메일 주소와 비밀번호 일치, 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 accessToken:
 *                   type: string
 *
 */

router.post('/sign-up', async (req, res)=>{
    res.status(201).send("signed up");

})


router.post('/sign-in', async (req, res)=>{
    res.status(200).send("signed in");

})


module.exports = router;