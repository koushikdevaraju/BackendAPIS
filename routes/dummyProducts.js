const express = require('express');
const router = express.Router();
const dummyProds = require('../models/dummyproducts');
router.get('/', async (req, res, next) => {
    try {
        const prods = await dummyProds.aggregate([{
            $group: {
                _id: "$product", productCountSum: {
                    $sum: "$quantity"
                }, quantitiesArr: {
                    $push: "$quantity"
                }
            }
        }]);
        return res.status(200).json({
            result: prods, message: 'Count of Products By Group'
        });
    } catch (err) {
        return res.status(500).json({
            message: err
        });
    }
});


router.post('/migrate/prods', async (req, res, next) => {
    try {
        const prods = await dummyProds.find();
        prods.map(async (data) => {
            data.tags = ['healthy', 'snacks'];
            await data.save();
        });
        return res.status(200).json({
            result: prods
        });
    } catch (err) {
        return res.status(500).json({
            result: err
        });
    }
})


module.exports = router;
