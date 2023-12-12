const express = require('express');
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");

const {User} = require('../models')

/**
 * @swagger
 * /users:
 *   get:
 *     summary: users/유저 정보 조회
 *     description: 모든 유저 정보를 조회한다.
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: Integer
 *                    description: The user's pk
 *                  email:
 *                    type: String
 *                    description: user's sigin-in id
 *
 */

router.get('/', authenticateToken, async (req, res, next) => {
	try{
		const id = req.user.id;
		const foundUser = await User.findOne({
			where:{id},
			attributes: ['id', 'email', 'createdAt' ]
		});
		res.status(200).send(foundUser);
	}catch(err){
		next();
	}
})

module.exports = router;