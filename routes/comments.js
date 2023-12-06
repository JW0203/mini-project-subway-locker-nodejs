const {Comment, Post } = require('../models');
const express = require('express');
const router  = express.Router();
const sequelize = require('../config/database');
const HttpException = require('../middleware/HttpException');

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

/**
 * @swagger
 * /comments:
 *   delete:
 *     summary: 댓글 삭제
 *     parameters:
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: integer
 *         description: comment pk id
 *         required: true
 *     responses:
 *       204:
 *         description: comment 삭제
 *
 */


router.post('/', async (req, res) =>{
	const {postId, comment} = req.body;

	await sequelize.transaction( async () =>{
		const validPost = await Post.findByPk(postId)
		if (!validPost){
			return res.status(400).send('Invalid post id')
		}
		const newComment = await Comment.create({
			comment,
			postId
		});
		res.status(201).send(newComment);
	})
})

router.delete('/:id', async (req, res) => {
	const id = req.params.id;

	try{
		const postIdValidation = await Post.findByPk(id);
		if(!postIdValidation){
			throw new HttpException(400, "게시물 id가 유효하지 않습니다.");
			return;
		}
		await Comment.destroy({where: id})
		res.status(204).send();
	}catch(err){
		res.status(500).send()
		throw new HttpException(500, "처리하는 도중에 서버에 오류가 발생했습니다.")
	}
})
module.exports = router;