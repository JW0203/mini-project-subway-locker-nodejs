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
 *     summary: 모든 게시물 찾기
 *     responses:
 *       200:
 *         description: 모든 게시물 찾기 성공
 *         application.json:
 *           schema:
 *             properties:
 *               title:
 *                 type:string
 *               content:
 *                 type: string
 */


/**
 * @swagger
 * /post/{email}:
 *   get:
 *     summary: 한 유저가 게시한 포스트 검색
 *     parameters:
 *       - in: path
 *         name: user email
 *         schema:
 *             type: string
 *         required: true
 *         description: 이메일 포멧  example@email.com
 *     responses:
 *       200:
 *         description: 유저의 게시물 찾기 성공
 *         application/json:
 *           schema:
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 */

// 게시물 게시
router.post('/', async (req, res) => {
	res.status(201).send('write a post')
})

//게시물 검색
router.get('/', async (req, res) =>{

	res.status(200).send("found all post")
})

// 유저 아이디로 게시물 검색
router.get('/:email', async(req, res) =>{
	const userEmail = req.params.email;
	res.status(200).send("found a user's post.")
})


module.exports = router;