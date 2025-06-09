const express = require('express');
const router = express.Router();
const Client = require('../models/client');

router.post('/register', async (req, res, next) => {
    try {
        const checkClient = await Client.findOne({name: req.body.name});
        if (checkClient) {
            return res.status(400).json({
                message: 'Client already exists'
            });
        }
        const newClient = new Client({
            name: req.body.name,
            address: req.body.name,
            campaignId: req.body.campaignId || null,
            organization: req.body.organization || null,
            status: true
        });
        await newClient.save();
        return res.status(201).json({
            message: newClient
        });

    } catch (err) {
        return res.status(500).json({
            error: err
        });
    }
})


router.post('/assignCampaign/:clientId', async (req, res, next) => {
    const {campaignId, organizationId} = req.body;
    const clientId = req.params.clientId;

    try {
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({
                message: 'Client not found'
            });
        }
        if (!client.organization) {
            client.organization = organizationId;
        }
        if (!client.campaignId) {
            client.campaignId = campaignId;
        }
        await client.save();
        return res.status(200).json({
            message: 'Campaign assigned successfully', result: client
        });
    } catch (err) {
        return res.status(500).json({
            message: err
        });
    }

})


module.exports = router;

