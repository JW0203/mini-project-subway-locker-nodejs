const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const { Post, User, Comment } = require('../models');
const HttpException = require('../middleware/HttpException');
const authenticateToken = require('../middleware/authenticateToken');
const { pagination } = require('../functions');

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
router.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit) || 5;

    if (!page || !limit) {
      throw new HttpException(400, '값을 입력해주세요.');
      return;
    }

    if (!Number.isInteger(page)) {
      throw new HttpException(400, 'page 값은 정수를 입력해주세요.');
      return;
    }

    if (!Number.isInteger(limit)) {
      throw new HttpException(400, 'limit 값은 정수를 입력해주세요.');
      return;
    }

    const { offset, totalPages, count } = await pagination(page, limit);

    if (page < 1 || page > totalPages) {
      throw new HttpException(400, `page 범위는 1부터 ${totalPages} 입니다.`);
      return;
    }

    const posts = await Post.findAll({
      order: [
        ['id', 'DESC'],
        ['createdAt', 'DESC'],
      ],
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
  } catch (err) {
    next(err);
  }
});

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
router.get('/user-email/:email', async (req, res, next) => {
  try {
    const email = req.params.email;
    console.log(email);
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
router.get('/post-id/:id', async (req, res, next) => {
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
