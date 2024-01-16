const { Comment, Post } = require('../models');
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
 *                 type: number
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: 댓글 게시 성공
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 id:
 *                   type: number
 *                 content:
 *                   type: string
 *                 postId:
 *                   type: number
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *
 *
 */
router.post('/', async (req, res, next) => {
  try {
    const { postId, content } = req.body;

    if (!postId) {
      throw new HttpException(400, '게시물 아이디: ${postId} 는 없습니다.');
      return;
    }

    const validPost = await Post.findByPk(postId);

    if (!validPost) {
      throw new HttpException(400, '해당 포스트가 없습니다.');
      return;
    }

    await sequelize.transaction(async () => {
      const newComment = await Comment.create({
        content,
        postId,
      });
      res.status(201).send(newComment);
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /comments/?limit=number&page=number:
 *   get:
 *     summary: 찾은 모든 댓글들을 페이지네이션
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 페이지 당 보여줄 댓글의 수
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 보고 싶은 페이지 번호
 *     responses:
 *       200:
 *         description: 해당 페이지안에 있는 댓글 찾기 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   content:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   postId:
 *                     type: number
 */
router.get('/', async (req, res, next) => {
  try {
    const page = req.query.page;
    const limit = Number(req.query.limit) || 5;
    if (page === '0') {
      throw new HttpException(400, `page는 1부터 시작합니다.`);
      return;
    }
    const offset = limit * (page - 1);
    const { count, rows } = await Comment.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    if (rows.length === 0) {
      throw new HttpException(400, `page ${page}에 데이터가 없습니다.`);
      return;
    }
    const allComments = await Comment.findAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.status(200).send(allComments);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: 아이디로 해당하는 댓글 검색
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: 아이디에 해당하는 댓글 찾기 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 content:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 postId:
 *                   type: number
 *
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const comment = await Comment.findByPk(id);
    if (!comment) {
      throw new HttpException(400, '해당하는 댓글이 없습니다.');
      return;
    }
    res.status(200).send(comment);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: 댓글 삭제
 *     description: 해당 아이디에 상응하는 댓글 삭제
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: ture
 *     responses:
 *       204:
 *         description: 삭제성공
 *
 *
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const comment = await Comment.findByPk(id);
    if (!comment) {
      throw new HttpException(400, '존재하지 않는 댓글입니다.');
      return;
    }
    await Comment.destroy({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
