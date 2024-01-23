const { Comment, Post } = require('../models');
const express = require('express');
const router = express.Router();
const HttpException = require('../middleware/HttpException');
const sequelize = require('../config/database');
const { pagination, checkRequiredParameters } = require('../functions');
const { authenticateToken, authorityConfirmation } = require('../middleware');
const UserAuthority = require('../models/enums/UserAuthority');

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
    if (!postId || !content) {
      throw new HttpException(400, 'postId 와 content를 입력해주세요');
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

    if (!page || !limit) {
      throw new HttpException(400, '값을 입력해주세요.');
      return;
    }
    if (!Number.isInteger(page)) {
      throw new HttpException(400, 'page 값은 숫자를 입력해주세요.');
      return;
    }

    if (!Number.isInteger(limit)) {
      throw new HttpException(400, 'limit 값은 숫자를 입력해주세요.');
      return;
    }
    const { offset, totalPages, count } = await pagination(page, limit);

    if (page < 1 || page > totalPages) {
      throw new HttpException(400, `page 범위는 1부터 ${totalPages} 입니다.`);
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
    if (!id) {
      throw new HttpException(400, '값을 입력해주세요');
      return;
    }

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
    if (!id) {
      throw new HttpException(400, '값을 입력해주세요');
      return;
    }

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

/**
 * @swagger
 * /comments/restore/{id}:
 *   patch:
 *     summary: 지운 댓글 복구
 *     description: 관리자 권한필요, 지워진 comments id 를 이용하여 복구
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: 삭제된 comments id
 *     responses:
 *       201:
 *         description: 삭제된 comment를 성공적으로 복구
 *         content:
 *           application.json:
 *             schema:
 *               properties:
 *                 id:
 *                   type: number
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 userId:
 *                   type: number
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 deletedAt:
 *                   type: string
 *                   format: date-time
 *                   default: null
 *                 postId:
 *                   type: number
 *
 */
router.patch('/restore/:id', authenticateToken, authorityConfirmation(UserAuthority.ADMIN), async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = checkRequiredParameters([id]);
    if (result.validation === false) {
      throw new HttpException(400, '복구할 comment 의 id 를 입력해주세요.');
      return;
    }

    if (!Number(id)) {
      throw new HttpException(400, '복구할 comment 의 id 는 숫자로 입력해주세요.');
      return;
    }

    const comment = await Comment.findOne({ where: { id } });
    if (comment) {
      throw new HttpException(400, '삭제된 comment가 아닙니다.');
      return;
    }

    await Comment.restore({ where: { id } });
    const restoredComment = await Comment.findOne({
      where: { id },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    res.status(200).send(restoredComment);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
