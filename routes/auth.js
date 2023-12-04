const {User }= require('../models');
const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const {Op} = require('sequelize');
const HttpException = require('../middleware/HttpException');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

const emptySpacePattern = /^\s&/;
const notSpecialCharacterPattern = /^[0~9, a-z, A-Z, _, -]$/;
const startEnglishNumberPattern = /^[0~9,a-z,A-Z];
const emailEndPattern = /^([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,5}$/;

router.post('/sign-up', async (req, res, next)=>{
    const {email, password} = req.body;

    try{
        await sequelize.transaction(async ()=>{
            const emailDuplication = User.findOne({
                where:{email}
            })
            const emailBeforeAt = email.split('@')[0];
            const emailAfterAt = email.split('@')[1];
            if(emailDuplication){
                throw new HttpException(401, "입력한 이메일은 이미 사용 중입니다.");
                return;
            }
            if (email.match(emptySpacePattern)){
                throw new HttpException(401, "입력 한 이메일에 공백이 있습니다.");
                return;
            }
            if (email.match(startEnglishNumberPattern)){
                throw new HttpException(401, "입력 한 이메일 시작이 숫자나 영어가 아닙니다.")
                return;
            }
            if (!emailBeforeAt.match(notSpecialCharacterPattern)){
                throw new HttpException(401, "입력 한 이메일의 로컬부분(사용자명) 부분에 특수문자가 있습니다.");
                return;
            }
            if (emailAfterAt.match(emailEndPattern)){
                throw new HttpException(401, "입력 한 이메일의 도메인 부분을 다시 확인해주세요.");
                return;
            }

            if (password.match(emptySpacePattern)){
                throw new HttpException(401, "입력한 비밀번호에 공백이 있습니다.")
                return;
            }
            if (password.length < 7 || password.length > 16){
                throw new HttpException(401, "입렵한 비밀번호는 8자리이상 15이하여야 합니다.")
                return;
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const newUser = await User.create({
                email,
                password : hashedPassword
            })
            res.status(201).send(newUser);
        })
    }catch(err){
        next(err);
    }

    res.status(201).send("signed up");

})


router.post('/sign-in', async (req, res, next)=>{
    const {email, password} = req.body;

    try{
        const isUserValid = User.findOne({
            where:{email}
        })
        if (!isUserValid){
            throw new HttpException(401, "이메일 이 존재 하지 않습니다.");
            return
        }
        const isPasswordValid = await bcrypt.compare(password, isUserValid.password);
        if (!isPasswordValid){
            throw new HttpException(401, "비밀번호가 틀립니다.")
        }

        const accessToken = jwt.sign({id: isUserValid.id}, process.env.JWT_SECRET_KEY,{
            expiresIn: "1m"
        });
        res.status(200).send({accessToken});
    }catch(err){
        next(err);
    }
})


module.exports = router;