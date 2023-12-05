const {Message, User }= require('../models');
const express = require('express');
const router = express.Router();
const HttpException = require('../middleware/HttpException')
const sequelize = require('../config/database')
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
 *               email:
 *                 type: string
 *                 description: 유저 로그인 여부 확인용
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
 * /posts/{email}:
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

/**
 * @swagger
 * /posts/{email}:
 *   patch:
 *     summary: 한 유저가 게시한 포스트 수정
 *     parameters:
 *       - in: path
 *         name: user email
 *         schema:
 *             type: string
 *         required: true
 *         description: 이메일 포멧  example@email.com
 *     requestBody:
 *       description: '수정할 부분이 담긴 데이터'
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               title:
 *                 type: string
 *                 description: 수정하고 싶은 타이틀
 *               content:
 *                 type: string
 *                 description: 수정하고 싶은 내용
 *
 *     responses:
 *       200:
 *         description: 유저의 게시물 수정 성공
 */

/**
 *@swagger
 * /posts/{postId}:
 *  delete:
 *     summary: 포스트 삭제
 *     parameters:
 *       - in: path
 *         name: post id
 *         schema:
 *             type: integer
 *         required: true
 *         description: post pk
 *     responses:
 *       204:
 *         description: 삭제 성공
 */

// 게시물 게시
router.post('/', async (req, res, next) => {
	const {email, title, content} = req.body;

	try{
		const userLogInCheck = await User.findOne({
			where:{email}
		})
		if(userLogInCheck.logInStatus === false){
			throw new HttpException(401, "로그인을 해주세요.");
			return;
		}
		const userPk = userLogInCheck.id;
		const newMessage = await Message.create({
			title,
			content,
			userPk
		})
		res.status(201).send(newMessage);
	}catch(err){
		next();
	}
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

// 유저가 게시한 포스트 수정
router.patch('/:email', async (req, res) =>{
	const userEmail = req.params.email;

	res.status(200).send("fix the post");
})

// 포스트 삭제
router.delete('/:postId', async (req, res) => {
	const postId = req.params.postId;
	res.send(204).send()
})


module.exports = router;

