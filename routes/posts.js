const {Message, User, Comment }= require('../models');
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
 * /posts/user-id/{email}:
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
 * /posts/{id}:
 *   get:
 *     summary: 게시한 포스트 아이디로 검색
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
 * /posts/{id}:
 *   patch:
 *     summary: 포스트 수정
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *             type: integer
 *         required: true
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
		const user = await User.findOne({
			where:{email}
		})
		// if(user.logInStatus === false){
		// 	throw new HttpException(401, "로그인을 해주세요.");
		// 	return;
		// }
		const userId = user.id;
		const newMessage = await Message.create({
			title,
			content,
			userId
		})
		res.status(201).send(newMessage);
	}catch(err){
		next();
	}
})

//모든 게시물 검색
router.get('/', async (req, res) =>{
	const id = req.params.id;
	const foundPosts = Message.findAll({
		order:[['createdAt', 'DESC']]
	});

	res.status(200).send(foundPosts);
})

// 유저 아이디로 게시물 검색
router.get('/user-id/:email', async(req, res, next) =>{
	const email = req.params.email;

	try{
		const user = await User.findOne({
			where:{email}
		})
		if(!user){
			// throw new HttpException(400, "해당 이메일을 가진 유저가 없습니다.")
			res.status(400).send( "해당 이메일을 가진 유저가 없습니다.")
			return;
		}
		const userId = user.id;
		console.log(userId)
		const foundPosts = await Message.findAll({
			where:{userId},
			order:[['createdAt', 'DESC']]
		});

		res.status(200).send(foundPosts)
	}catch(err){
		next()
	}
	// res.status(200).send("found a user's post.")
})

// 포스트 아이디로 게시물 검색
router.get('/:id', async(req, res, next) => {
	const id = req.params.id;
	try{
		await sequelize.transaction(async()=>{
			const foundMessage = await Message.findByPk(id);
			if(!foundMessage){
				// throw new HttpException(400, "해당하는 게시물이 없습니다.")
				res.status(400).send("해당하는 게시물이 없습니다.")
				return;
			}
			res.status(200).send(foundMessage);
		})
	}catch(err){
		next();
	}
})



// 포스트 아이디로 게시물 수정
router.patch('/:id', async (req, res, next) =>{
	const id = req.params.id;
	const {title, content} = req.body
	console.log(id);
	try{
		await sequelize.transaction(async()=> {

			const validId = await Message.findByPk(id);
			console.log(validId)
			if (!validId){
				console.log("not valid");
				//throw new HttpException(400, "선택한 게시물이 없습니다."); - error 발생
				return res.status(400).send("선택한 게시물이 없습니다."); //작동
			}
			await Message.update(
				{
					title,
					content
				},
				{
					where : {id}
				}
			)
		});
		const revisedPost = await Message.findByPk(id);
		res.status(200).send(revisedPost)
	} catch (err) {
		next();
	}
})

// 포스트 삭제
router.delete('/:id', async (req, res, next) => {
	const id = req.params.id;

	try{
		const findMessage = await Message.findByPk(id);
		if(!findMessage){
			res.status(400).send( "There are no message with given id")
			// throw new HttpException(400, "There are no message")
			// return;
		}

		await Message.destroy({where:{id}})
		const findComments = await Comment.findAll({
			where:{postId: id}
		})
		if(findComments){
			await Comment.destroy({where:{postId:{id}}})
		}
		res.status(204).send()
	}catch(err){
		next();
	}
})


module.exports = router;

