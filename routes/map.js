const naverMapAPI = ''
const {Station } = require('../models');
const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const {Op} = require('sequelize');


/**
 * @swagger
 * /map:
 *   post:
 *    summary: "보관소위치를 맵에 표시"
 *    description: "station 모델에서 모든 역의 위치를 검색하여서 전부 네이버 맵에 표시"
 *    responses:
 *       200:
 *        description: Station 모델에 있는 역 위치정보를 전부 다 맵에 표시 성공
 */

router.post('/', async (req, res) => {
	res.status(200).send('map')
})

/**
 * @swagger
 * /maps/{station}:
 *   post:
 *     summary: station 위치 조회 및 맵에 표시
 *     description: 선택된 역에 있는 위치만 맵에 표시
 *     parameters:
 *      - in: path
 *        name: station
 *        required: true
 *        description :  the name and location of the station
 *        schema:
 *          type: string
 *
 *     responses:
 *       200:
 *         description: 조회 성공
 */

router.post('/:station', async (req, res) =>{
	res.status(200).send('a station map')
})

module.exports = router;