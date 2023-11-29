const {Locker } = require("../models");
const sequelize = require("../config/database");
const express = require("express");
const router = express.Router();
const {Op} = require("sequelize");

/**
 * @swagger
 * /lockers/{stationName}:
 *   get:
 *     summary: 사물함 정보 조회
 *     description: 역에 있는 모든 유저 정보를 조회한다.
 *     parameters:
 *      - in: path
 *        name: station name
 *        required: true
 *        description :  the name of a station
 *        schema:
 *          type: string
 *
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  stationName:
 *                      type: string
 *                      description: The station's name
 *                  lockerNumber:
 *                      type: integer
 *                      description : The number label of the locker
 *                  userInUse:
 *                      type: integer
 *                      description : The pk number of user
 *                  startDate:
 *                      type: date
 *                      description : Locker use start date
 *                  expirationDate:
 *                      type: date
 *                      description : Locker use expiration date
 */

router.get("/:stationName", async (req, res)=>{
    const stationName = req.params.stationName;
    console.log(stationName)
    // const lockers = await Locker.findAll({
    //     where:{
    //         stationName
    //     }
    // })
    // res.status(200).send(lokers);
    res.status(200).send("역 보관함 검색");
})

module.exports = router;