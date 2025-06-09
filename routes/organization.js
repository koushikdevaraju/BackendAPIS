const express = require('express');
const router = express.Router();
const authCheck = require('../middleware/authCheck');
const Organization = require('../models/organization');

// api create organization
router.post('/create', authCheck(['Super Admin', 'Admin']), async (req, res) => {
    try {
        const organization = await Organization.findOne({name: req.body.name});
        if (organization) {
            return res.status(400).json({
                message: 'organization already exists'
            });
        }
        const newOrg = new Organization({
            name: req.body.name,
            address: req.body.address,
            url: req.body.url,
            primaryColor: req.body.primaryColor,
            secondaryColor: req.body.secondaryColor,
        });
        await newOrg.save();
        return res.status(201).json({
            result: newOrg, message: 'Organization Created'
        });

    } catch (err) {
        res.status(500).json({
            message: err
        });
    }
});


module.exports = router;
