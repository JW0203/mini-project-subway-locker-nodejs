const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const { Post, User, Comment } = require('../models');
const HttpException = require('../middleware/HttpException');
const authenticateToken = require('../middleware/authenticateToken');

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
 *                 userId:
 *                   type: Integer
 */

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const id = req.user.id;
    console.log(id);
    const user = await User.findByPk(id);

    if (!user) {
      throw new HttpException(400, '해당하는 이메일은 등록되어 있지 않습니다.'); // 오류
      return;
    }

    await sequelize.transaction(async () => {
      const userId = user.id;
      const newPost = await Post.create({
        title,
        content,
        userId,
      });
      res.status(201).send(newPost);
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: 모든 게시물 찾기
 *     responses:
 *       200:
 *         description: 모든 게시물 찾기 성공
 *         application/json:
 *           schema:
 *             title:
 *               type:string
 *             content:
 *               type: string
 *             userId:
 *               type: integer
 */

router.get('/', async (req, res, next) => {
  try {
    const allPosts = await Post.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.status(200).send(allPosts);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /posts/user-id/{email}:
 *   get:
 *     summary: 유저 이메일로 유저가 게시한 게시물 찾기
 *     parameters:
 *       - in: path
 *         name: user email
 *         schema:
 *           type: string
 *         required: true
 *         description: 이 메일 포멧
 *     responses:
 *       200:
 *         description: 유저가 게시한 게시물 찾기 성공
 *         application/json:
 *           schema:
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               userId:
 *                 type: integer
 */
router.get('/user-id/:email', async (req, res, next) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      // throw new HttpException(400, "해당 이메일을 가진 유저가 없습니다.")
      res.status(400).send('해당 이메일을 가진 유저가 없습니다.');
      return;
    }
    const userId = user.id;
    console.log(userId);
    const foundPosts = await Post.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).send(foundPosts);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: 게시물 아이디를 이용한 게시물 검색
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: 게시물 검색 성공
 *         application/json:
 *           schema:
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               userId:
 *                 type: integer
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const foundPosts = await Post.findByPk(id);
    if (!foundPosts) {
      throw new HttpException(400, '해당하는 게시물이 없습니다.');
      return;
    }
    res.status(200).send(foundPosts);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /posts/{id}:
 *   patch:
 *     summary: 게시물 수정
 *     description: 게시물의 아이디를 받고 해당 게시물을 수정
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       description: 수정 할 title 과 content
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             title:
 *               type: string
 *             content:
 *               type: sting
 *     responses:
 *       200:
 *         description: 수정 성공, 수정된 게시글 제공
 *         content:
 *           application/json:
 *             schema:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               userId:
 *                 type: integer
 *
 *
 */

router.patch('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { title, content } = req.body;

    const postValidation = await Post.findByPk(id);
    if (!postValidation) {
      throw new HttpException(400, '존재하지 않는 포스트 아이디 입니다.');
      return;
    }
    await Post.update(
      {
        title,
        content,
      },
      { where: { id } },
    );
    const revisedPost = await Post.findByPk(id);
    res.status(200).send(revisedPost);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *   summary: 게시물 삭제
 *   description: 게시물 삭제전에 댓글이 있으면 댓글도 삭제 후 게시물 삭제
 *   parameters:
 *     - in: path
 *       name: id
 *       schema:
 *         type: integer
 *       required: ture
 *   responses:
 *     204:
 *       description: 삭제성공
 *
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findByPk(id);

    if (!post) {
      throw new HttpException(400, '주어진 id값을 가지는 게시물이 없습니다.');
      return;
    }

    const comment = Comment.findAll({
      where: { postId: id },
    });

    if (comment) {
      await Comment.destroy({ where: { postId: id } });
    }
    await Post.destroy({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
module.exports = router;
