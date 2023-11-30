const User = require('../models');
const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const {Op} = require('sequelize');


/**
 * @swagger
 * /auth/sign-up:
 *
 *    post:
 *        summary: 회원가입
 *        requestBody:
 *            description: 회원가입을 위한 이 메일과 비밀번호
 *            required: true
 *            content:
 *                application/json:
 *                    schema:
 *                        properties:
 *                            id:
 *                                type: integer
 *                                description: P.K 값
 *                            email:
 *                                type: string
 *                                description: 로그인 아이디
 *                            password:
 *                                type: string
 *                                description: 로그인 비밀번호
 *
 *        responses:
 *            201:
 *            description: 회원가입 성공
 *            content:
 *                application/json:
 *                    schema:
 *                        properties:
 *                            email:
 *                                type: string
 *                                description: 유저 아이디
 *                            password:
 *                                type: string
 *                                description: 유저 비밀번호
 *
 * /auth/sign-in:
 *    post:
 *        summary: 로그인 API
 *
 *        requestBody:
 *            description: 로그인을 위한 이메일과 비밀번호
 *            required: true
 *            content:
 *                application/json:
 *                    schema:
 *                    properties:
 *                        email:
 *                            type: string
 *                            description: 로그인 아이디
 *                        password:
 *                            type: string
 *                            description: 로그인 비밀번호
 *
 *        responses:
 *            200:
 *            description: 로그인 성공, JWT access token 제공
 *            content:
 *                application/json:
 *                    schema:
 *                        properties:
 *                            accessToken:
 *                                type: string
 *                                description: JWT access token
 */

router.post('/sign-up', async (req, res)=>{
    res.status(201).send("signed up");

})

router.post('/sign-in', async (req, res)=>{
    res.status(200).send("signed in");

})


module.exports = router;