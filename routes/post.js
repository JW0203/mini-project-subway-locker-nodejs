const {Message }= require('../models');
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: 문의사항 게시
 *     requestBody:
 *       description: 문의 사항을 게시하기위한 제목과 내용
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: 문의사항 성공적으로 게시
 *         content:
 *           application.json:
 *             schema:
 *               properties:
 *                 title:
 *                   type: string
 *                   description: 게시된 게시물 제목
 *                 content:
 *                   type: string
 *                   description: 게시된 게시물 내용
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: 게시물 찾기
 *     description: 유저의 아이디인 이메일을 이용하여 게시물 찾기
 *     requestBody:
 *       description: 유저의 이메일 아이디를 요청
 *       required: true
 *       content:
 *
 *
 */


// 게시물 게시
router.post('/', async (req, res) => {
	res.status(201).send('write a post')
})

//게시물 검색
router.get('/', async (req, res) =>{
	res.status(200).send("found the post using users' email")
})


module.exports = router;