const {Station} = require('../models');
const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const HttpException = require('../middleware/HttpException');


router.post('/', async (req, res, next) => {
	try{
		const {data} = req.body;
		console.log(data)
		res.status(201).send(data);
		for(let n in data){
			const {station, latitude, longitude} = data[n];
			await Station.create({
				name:station, latitude, longitude
			})
		}
	}catch(err){
		next(err);
	}
})

module.exports = router;