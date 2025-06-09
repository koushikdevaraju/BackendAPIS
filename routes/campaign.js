const express = require('express');
const router = express.Router();
const Campaign = require('../models/campaign');


router.post('/register', async (req, res, next) => {
    const body = req.body;
    try {
        const campaign = await Campaign.findOne({name: req.body.name});
        if (campaign) {
            return res.status(400).json({
                message: 'campaign already exists'
            });
        }

        const newCampaign = new Campaign(body);
        await newCampaign.save();
        return res.status(201).json({
            message: newCampaign
        });
    } catch (err) {
        return res.status(500).json({
            error: err
        });
    }
})


module.exports = router;
