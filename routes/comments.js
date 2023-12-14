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

module.exports = router;