const {Comment, Post} = require('../models');
const express = require('express');
const router = express.Router();
const HttpException = require('../middleware/HttpException');
const sequelize = require('../config/database');

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: 유저 게시물에 댓글 게시하기
 *     requestBody:
 *       description: 게시물 아이디와 게시할 댓글 요청
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               postId:
 *                 type: integer
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: 댓글 게시 성공
 */
router.post('/', async(req, res, next) => {
	try{
		const {postId, comment} = req.body;
		const validPost = await Post.findByPk(postId);
		if(!validPost){
			if(!postId){
				throw new HttpException(400, `게시물 아이디: ${postId}`);
				return
			}
			throw new HttpException(400, "해당 포스트가 없습니다.");
			return;
		}

		await sequelize.transaction(async () =>{
			const newComment = await Comment.create({
				comment,
				postId
			});
			res.status(201).send(newComment);
		})
	}catch(err){
		next(err);
	}
})

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: 게시된 모든 댓글 검색
 *     responses:
 *       200:
 *         description: 댓글 검색 성공
 */
router.get('/', async(req, res, next)=>{
	try{
		const allComments = await Comment.findAll({
			order:[['postId', 'ASC']]
		});
		res.status(200).send(allComments)
	}catch (err){
		next(err);
	}
})

/**
 * @swagger
 * /comments/{postId}:
 *   get:
 *     summary: 게시물 아이디로 해당하는 댓글 검색
 *     parameters:
 *       - in: path
 *         name: 게시물 아이디
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: 게시물 아이디에 해당하는 댓글 찾기 성공
 */
router.get('/:postId', async(req, res, next)=>{
	try{
		const postId = req.params.postId;
		const allComments = await Comment.findAll({
			where:{postId},
			order:[['postId', 'ASC']]
		});
		if(!allComments){
			throw new HttpException(400, "해당하는 게시물 아이디가 없습니다.");
			return;
		}
		res.status(200).send(allComments)
	}catch (err){
		next(err);
	}
})

module.exports = router;