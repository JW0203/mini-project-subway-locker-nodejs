const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const { Post, User, Comment } = require('../models');
const HttpException = require('../middleware/HttpException');
const { authenticateToken, authorityConfirmation } = require('../middleware');
const { UserAuthority } = require('../models/enums');
const { pagination, asyncHandler } = require('../functions');
const { emailValidation } = require('../functions/signUpEmailPasswordValidation');

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: 문의사항 게시
 *     requestBody:
 *       description: 로그인 한 유저가 문의 사항을 게시하기위한 제목과 내용, jwt 토큰은 local storage 에서 읽어온다.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
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
 *
 */

router.post(
  '/',
  authenticateToken,
  authorityConfirmation(UserAuthority.USER),
  asyncHandler(async (req, res, next) => {
    const { title, content } = req.body;
    const id = req.user.id;

    if (!title || !content) {
      throw new HttpException(400, 'title, content 를 모두 입력해주세요.');
    }

    if (title.replace(/ /g, '') === '') {
      throw new HttpException('title 에 문자를 입력해주세요.');
    }

    if (content.replace(/ /g, '') === '') {
      throw new HttpException('content 에 문자를 입력해주세요.');
    }

    await sequelize.transaction(async () => {
      const newPost = await Post.create({
        title,
        content,
        userId: id,
      });
      res.status(201).send(newPost);
    });
  }),
);

/**
 * @swagger
 * /posts/?limit=number&page=number:
 *   get:
 *     summary: 찾은 모든 게시물을 페이지네이션
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 페이지 당 보여줄 게시물의 수
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 보고 싶은 페이지 번호
 *     responses:
 *       200:
 *         description: 해당 페이지안에 있는 게시물 찾기 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       userId:
 *                         type: number
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     totalPages:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     offset:
 *                       type: number
 *                     count:
 *                       type: number
 *                     page:
 *                       type: number
 *                       example: 1
 *                     previousNumber:
 *                       type: number
 *                       nullable: true
 *                       example: null
 *                     nextNumber:
 *                       type: number
 *                       nullable: true
 *                       example: 2
 *
 */
router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit) || 5;

    if (!page || !limit) {
      throw new HttpException(400, 'page 와 limit 값을 모두 입력해주세요.');
    }

    if (!Number.isInteger(page)) {
      throw new HttpException(400, 'page 값은 숫자를 입력해주세요.');
    }

    if (!Number.isInteger(limit)) {
      throw new HttpException(400, 'limit 값은 숫자를 입력해주세요.');
    }

    const { offset, totalPages, count } = await pagination(page, limit);

    if (page < 1 || page > totalPages) {
      throw new HttpException(400, `page 범위는 1부터 ${totalPages} 입니다.`);
    }

    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const items = [];
    for (let i = 0; i < posts.length; i++) {
      items.push(posts[i].dataValues);
    }

    // let nextPage = (page+1< totalPages)? page +1 : null;
    let nextPage;
    if (page + 1 < totalPages) {
      nextPage = page + 1;
    } else {
      nextPage = null;
    }

    let previousPage;
    if (page - 1 > 0) {
      previousPage = page - 1;
    } else {
      previousPage = null;
    }

    const metadata = {
      totalPages,
      limit,
      offset,
      count,
      previousPage,
      page,
      nextPage,
    };

    const paginationInfo = {
      items,
      metadata,
    };

    res.status(200).send(paginationInfo);
  }),
);

/**
 * @swagger
 * /posts/user-email/{email}:
 *   get:
 *     summary: 유저 이메일로 유저가 게시한 게시물 찾기
 *     parameters:
 *       - in: path
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         required: true
 *         description: 유저 이메일
 *     responses:
 *       200:
 *         description: 유저가 게시한 게시물 찾기 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   userId:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 */
router.get(
  '/user-email/:email',
  asyncHandler(async (req, res, next) => {
    const email = req.params.email;
    if (!email) {
      throw new HttpException(400, 'email 값을 입력해주세요.');
    }
    const emailValidationResult = emailValidation(email);
    if (emailValidationResult.validation === false) {
      throw new HttpException(emailValidationResult.statusCode, emailValidationResult.message);
    }
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      throw new HttpException(400, '해당 이메일을 가진 유저가 없습니다.');
    }
    const userId = user.id;
    const foundPosts = await Post.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).send(foundPosts);
  }),
);

/**
 * @swagger
 * /posts/post-id/{id}:
 *   get:
 *     summary: 게시물 아이디를 이용한 게시물 검색
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: 게시물 아이디
 *     responses:
 *       200:
 *         description: 게시물 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 id:
 *                  type: number
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 userId:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 */
router.get(
  '/post-id/:id',
  authenticateToken,
  authorityConfirmation(UserAuthority.BOTH),
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
      throw new HttpException(400, 'id 값을 입력해주세요.');
    }

    if (Number.isInteger(Number(id)) === false) {
      throw new HttpException(400, 'id 는 숫자를 입력해주세요');
    }

    const foundPosts = await Post.findByPk(id);
    if (!foundPosts) {
      throw new HttpException(400, '해당하는 게시물이 없습니다.');
    }
    res.status(200).send(foundPosts);
  }),
);

/**
 * @swagger
 * /posts/{id}:
 *   patch:
 *     summary: 게시물 수정
 *     description: 유저가 로그인 한 후, 게시물의 아이디를 받고 해당 게시물을 수정
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: 게시물 아이디
 *     requestBody:
 *       description: 수정 할 title 과 content
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 수정 성공, 수정된 게시글 제공
 *         content:
 *           application/json:
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
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *
 */

router.patch(
  '/:id',
  authenticateToken,
  authorityConfirmation(UserAuthority.USER),
  asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const { title, content } = req.body;
    if (!id) {
      throw new HttpException(400, 'id 값을 입력해주세요.');
    }
    if (!Number.isInteger(id)) {
      throw new HttpException(400, 'id 값은 숫자로 입력해주세요.');
    }

    const postValidation = await Post.findByPk(id);
    if (!postValidation) {
      throw new HttpException(400, '존재하지 않는 포스트 아이디 입니다.');
    }

    if (title && title.replace(/ /g, '') === '') {
      throw new HttpException('title 에 수정할 문자를 입력해주세요.');
    }

    if (content && content.replace(/ /g, '') === '') {
      throw new HttpException('content 에 내용을 입력해주세요.');
    }

    if (title && content) {
      await Post.update(
        {
          title,
          content,
        },
        { where: { id } },
      );
    } else if (title) {
      await Post.update(
        {
          title,
        },
        { where: { id } },
      );
    } else if (content) {
      await Post.update(
        {
          content,
        },
        { where: { id } },
      );
    }

    const revisedPost = await Post.findByPk(id);
    res.status(200).send(revisedPost);
  }),
);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: 게시물 삭제
 *     description: 게시물 삭제전에 댓글이 있으면 댓글도 삭제 후 게시물 삭제
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
  authorityConfirmation(UserAuthority.BOTH),
  asyncHandler(async (req, res, next) => {
    const id = Number(req.params);
    const userAuth = req.user.authority;
    const userId = req.user.id;
    if (!id) {
      throw new HttpException(400, 'id 값을 입력해주세요.');
    }
    if (!Number.isInteger(id)) {
      throw new HttpException(400, 'id 값은 숫자를 입력해주세요.');
    }

    const post = await Post.findByPk(id);
    if (!post) {
      throw new HttpException(400, '주어진 id 값을 가지는 게시물이 없습니다.');
    }

    if (userAuth === UserAuthority.USER && post.userId !== userId) {
      throw new HttpException(400, '해당 게시물 삭제 권한이 없습니다.');
    }

    const comment = Comment.findOne({
      where: { postId: id },
    });

    if (comment) {
      await Comment.destroy({ where: { postId: id } });
    }
    await Post.destroy({ where: { id } });
    res.status(204).send();
  }),
);

/**
 * @swagger
 * /posts/restore/{id}:
 *   post:
 *     summary: 지운 post 복구
 *     description: 관리자 권한필요, 지워진 post id 를 이용하여 복구
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: 삭제된 post id
 *     responses:
 *       201:
 *         description: 삭제된 게시물 성공적으로 복구
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
 *
 */
router.post(
  '/restore/:id',
  authenticateToken,
  authorityConfirmation(UserAuthority.ADMIN),
  asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);

    if (!id) {
      throw new HttpException(400, '복구할 포스트의 id 를 입력해주세요.');
    }

    if (!Number.isInteger(id)) {
      throw new HttpException(400, '복구할 포스트의 id 는 숫자로 입력해주세요.');
    }

    const post = await Post.findOne({ where: { id } });
    if (post) {
      throw new HttpException(400, '삭제된 post 가 아닙니다.');
    }
    await Post.restore({ where: { id } });
    const retoredComment = await Comment.restore({ where: { postId: id } });
    const restoredPost = await Post.findOne({ where: { id } });
    if (!retoredComment) {
      res.status(200).send(restoredPost);
    } else {
      const restoredPostComment = {
        post: restoredPost,
        comments: retoredComment,
      };
      res.status(200).send(restoredPostComment);
    }
  }),
);

module.exports = router;
