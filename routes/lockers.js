const {Locker, Station, User, Post} = require('../models');
const sequelize = require('../config/database');
const express = require('express');
const router = express.Router();
const HttpException = require('../middleware/HttpException');


/**
 * @swagger
 * /stations:
 *   post:
 *     summary: 역에 라커 추가하기
 *     requestBody:
 *       description: 역 이름
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: 라커 추가 성공
 */

router.post('/', async (req, res, next) => {

    console.log('---1111');
    try{
        const {name} = req.body;
        console.log(name)
        const station  = await Station.findOne({
            where:{name}
        })
        if (!station){
            throw new HttpException(400, "해당하는 역은 등록되어 있지 않습니다."); // 오류
            return;
        }

        await sequelize.transaction(async () => {
            const stationId = station.id;
            const newLocker = await Post.create({
                stationId
            });
            res.status(201).send(newLocker);
        })
    }catch(err){
        next(err);
    }
})
// router.post('/', async (req, res, next) => {
//     const {name} = req.body;
//     try{
//         console.log(name);
//         const stationNameValidation = await Station.findOne({
//             where:{name}
//         })
//
//         if(!stationNameValidation){
//             throw new HttpException(400, "없는 역명입니다.");
//             return;
//         }
//         const stationId = stationNameValidation.id;
//         const newLocker = await Locker.create({
//             userInUse: 'No',
//             stationId
//         })
//         res.status(201).send(newLocker);
//     }catch(err){
//         next(err);
//     }
// })




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

// router.get('/:stationName', async (req, res)=>{
//     const stationName = req.params.stationName;
//     console.log(stationName)
//     // const lockers = await Locker.findAll({
//     //     where:{
//     //         stationName
//     //     }
//     // })
//     // res.status(200).send(lokers);
//     res.status(200).send('역 보관함 검색');
// })

module.exports = router;