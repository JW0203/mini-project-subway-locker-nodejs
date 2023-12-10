const {Comment, Message} = require('../models');
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


router.post('/', async (req, res, next) =>{
	const {messageId, comment} = req.body;
	try{
		await sequelize.transaction( async () =>{
			const validMessage = await Message.findByPk(messageId)
			if (!validMessage){
				return res.status(400).send('Invalid message id');
			}
			const newComment = await Comment.create({
				comment,
				messageId
			});
			res.status(201).send(newComment);
		})
	}catch(err){
		next();
	}
})

router.delete('/:id', async (req, res, next) => {
	const id = req.params.id;

	try{
		const IdValidation = await Comment.findByPk(id);
		if(!IdValidation){
			// throw new HttpException(400, "댓글 id가 유효하지 않습니다.");
			res.status(400).send("댓글 id가 유효하지 않습니다.");
			return;
		}
		await Comment.destroy({where: {id}})

		res.status(204).send();
	}catch(err){
		// console.log(err) // throw 는 받는데 next() 가 app.js로 못 넘겨주고 있는 듯???
		// next();
		res.status(500).send("처리하는 도중에 서버에 오류가 발생했습니다.")
		// throw new HttpException(500, "처리하는 도중에 서버에 오류가 발생했습니다.")
	}
})
module.exports = router;