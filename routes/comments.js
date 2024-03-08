const { Comment, Post, Station } = require('../models');
const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const { asyncHandler } = require('../functions');
const { authenticateToken, authorityConfirmation, HttpException } = require('../middleware');
const { UserAuthority } = require('../models/enums');

/**
 * @swagger
 * /comments/{id}:
 *   post:
 *     summary: 유저 게시물에 댓글 게시하기
 *     requestBody:
 *       description: 관리자가 로그인 한 후 게시물 아이디와 게시할 댓글 요청
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
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
router.post(
  '/',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN]),
  asyncHandler(async (req, res) => {
    const { postId, content } = req.body;
    if (!postId || !content) {
      throw new HttpException(400, 'postId 와 content를 입력해주세요');
    }
    if (!Number.isInteger(postId) || postId <= 0) {
      throw new HttpException(400, '유효한 postId 를 숫자로 입력해주세요.');
    }
    if (content.replace(/ /g, '') === '') {
      throw new HttpException(400, 'content 는 빈공간일 수 없습니다.');
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      throw new HttpException(404, '해당 포스트가 없습니다.');
    }

    await sequelize.transaction(async () => {
      const newComment = await Comment.create({
        content,
        postId,
      });
      res.status(201).send(newComment);
    });
  }),
);

/**
 * @swagger
 * /comments?postId={postId}:
 *   get:
 *     summary: postId로 해당하는 댓글 검색
 *     description : 로그인 관리자 혹은 댓글에 해당하는 포스트를 게시한 유저가 로그인한 후에 검색 가능
 *     parameters:
 *       - in: query
 *         name: postId
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
 *                 postId:
 *                   type: number
 *
 */
router.get(
  '/',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN, UserAuthority.USER]),
  asyncHandler(async (req, res) => {
    const postId = Number(req.query.postId);
    const { authority: userAuthority, id: userId } = req.user;

    if (!postId) {
      throw new HttpException(400, 'comment 의 id 를 입력해주세요');
    }
    if (!Number.isInteger(postId) || postId <= 0) {
      throw new HttpException(400, '유효한 commentId 를 숫자로 입력해주세요.');
    }

    const comments = await Comment.findAll({
      where: { postId },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    if (comments.length === 0) {
      throw new HttpException(404, '해당하는 댓글이 없습니다.');
    }

    const post = await Post.findOne({
      where: { id: postId, userId },
    });

    if (userAuthority === UserAuthority.USER && !post) {
      // 인증 후 특정 작업을 수행할 권한이 없음을 나타내는 상태코드
      throw new HttpException(403, '해당 댓글에 대한 접근 권한이 없습니다.');
    }

    res.status(200).send(comments);
  }),
);

/**
 * @swagger
 * /comments/{id}:
 *   patch:
 *     summary: comments 수정
 *     description: 관리자가 로그인 한 후, comments 아이디를 받고 해당 comments를 수정
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: comments 아이디
 *     requestBody:
 *       description: 수정하고 싶은 내용을 입력
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 수정 성공, 수정된 comments 정보 제공
 *         content:
 *           application/json:
 *             schema:
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
 */

router.patch(
  '/:id',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN]),
  asyncHandler(async (req, res) => {
    const commentId = Number(req.params.id);
    const { content } = req.body;

    if (!commentId) {
      throw new HttpException(400, 'commentId 값을 입력해주세요.');
    }
    if (!Number.isInteger(commentId) || commentId <= 0) {
      throw new HttpException(400, '유효한 commentId 를 숫자로 입력해주세요.');
    }
    if (!content) {
      throw new HttpException(400, '수정할 내용을 입력해주세요.');
    }
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      throw new HttpException(404, '존재하지 않는 comment 아이디 입니다.');
    }

    if (content && content.replace(/ /g, '') === '') {
      throw new HttpException(400, '수정할 내용을 입력해주세요.');
    }

    await sequelize.transaction(async () => {
      await Comment.update(
        {
          content,
        },
        { where: { id: commentId } },
      );
    });

    const revisedComment = await Comment.findByPk(commentId);
    res.status(200).send(revisedComment);
  }),
);

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
router.delete(
  '/:id',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN]),
  asyncHandler(async (req, res) => {
    const commentId = Number(req.params.id);
    if (!commentId) {
      throw new HttpException(400, 'comment 의 id 를 입력해주세요');
    }

    if (!Number.isInteger(commentId) || commentId <= 0) {
      throw new HttpException(400, '유효한 commentId 를 숫자로 입력해주세요.');
    }

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      throw new HttpException(404, '존재하지 않는 댓글입니다.');
    }

    await Comment.destroy({ where: { id: commentId } });
    res.status(204).send();
  }),
);

/**
 * @swagger
 * /comments/restore/{id}:
 *   post:
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
router.post(
  '/restore/:id',
  authenticateToken,
  authorityConfirmation([UserAuthority.ADMIN]),
  asyncHandler(async (req, res) => {
    const commentId = Number(req.params.id);
    if (!commentId) {
      throw new HttpException(400, 'comment 의 id 를 입력해주세요');
    }

    if (!Number.isInteger(commentId) || commentId <= 0) {
      throw new HttpException(400, ' 유효한 commentId 를 숫자로 입력해주세요.');
    }

    const comment = await Comment.findOne({ where: { id: commentId } });
    if (comment) {
      throw new HttpException(422, '삭제된 comment 가 아닙니다.');
    }

    await Comment.restore({ where: { id: commentId } });
    const restoredComment = await Comment.findOne({
      where: { id: commentId },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    res.status(200).send(restoredComment);
  }),
);

module.exports = router;
