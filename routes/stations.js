const { Station, Locker } = require('../models');
const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const HttpException = require('../middleware/HttpException');

/**
 * @swagger
 * /stations:
 *   post:
 *     summary: 역 추가
 *     requestBody:
 *       description: 역 추가를 위한 이름, 좌표 값
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: 역 추가 성공
 *
 *
 */
router.post('/', async (req, res, next) => {
  try {
    const { data } = req.body;
    const newStations = [];
    for (let n in data) {
      const { name, latitude, longitude } = data[n];
      const stationDuplication = await Station.findOne({
        where: { name },
      });
      if (stationDuplication) {
        throw new HttpException(400, `${name} 은 이미 저장되어 있습니다.`);
        return;
      }
      const station = await Station.create({
        name,
        latitude,
        longitude,
      });
      newStations.push(station);
    }
    res.status(201).send(newStations);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /stations:
 *   get:
 *     summary: 모든 역 찾기
 *     responses:
 *       200:
 *         description: 모든 역 찾기 성공
 */
router.get('/', async (req, res, next) => {
  try {
    const allStations = await Station.findAll();
    res.status(200).send(allStations);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /stations/{id}:
 *   get:
 *     summary: 역 아이디로 해당 역 찾기
 *     parameters:
 *       - in: path
 *         name: station id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: 역 위치와 해당 역에 있는 사물함 찾기 성공
 */

router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;

    const station = await Station.findAll({
      where: { id },
      include: [
        {
          model: Locker,
          where: { stationId: id },
        },
      ],
    });

    if (!station) {
      throw new HttpException(400, '해당하는 역은 없습니다.');
      return;
    }

    res.status(200).send(station);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /stations/{name}:
 *   delete:
 *   summary: 역 삭제
 *   parameters:
 *     - in: path
 *       name: name
 *       schema:
 *         type: string
 *       required: ture
 *   responses:
 *     204:
 *       description: 삭제성공
 *
 */
router.delete('/:name', async (req, res, next) => {
  try {
    const name = req.params.name;
    const nameValidation = await Station.findOne({
      where: { name },
    });
    if (!nameValidation) {
      throw new HttpException(400, '없는 역이름 입니다.');
    }
    await Station.destroy({ where: { name } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
module.exports = router;
