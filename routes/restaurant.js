const express = require('express');
const router = express.Router();
const Restaurant = require('../models/restaurant');

router.post('/create', async (req, res, next) => {
    const body = req.body;
    try {
        const checkRest = await Restaurant.find({name: body.name});
        if (checkRest.length > 0) {
            return res.status(400).json({
                message: 'Restaurant already exists'
            });
        }
        const restaurant = new Restaurant(body);
        await restaurant.save();
        return res.status(200).json({
            restaurant: restaurant
        });
    } catch (error) {
        return res.status(500).json({
            error: error
        })
    }
});

router.get('/:restId', async (req, res, next) => {
    const restId = req.params.restId;
    try {
        const restaurant = await Restaurant.findById(restId);
        if (!restaurant) {
            return res.status(404).json({
                error: 'restaurant not found'
            });
        }
        return res.status(200).json({
            result: restaurant
        });
    } catch (error) {
        return res.status(500).json({
            error: error
        });
    }
})


module.exports = router;
