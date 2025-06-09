const express = require('express');
const router = express.Router();
const Content = require('../models/content');
const authCheck = require('../middleware/authCheck');
// content create API
router.post('/create', authCheck(['Super Admin']), async (req, res, next) => {
    try {
        const {contentName, additionalData, status} = req.body;
        const newContent = new Content({
            contentName: contentName, additionalData: additionalData, status: status
        });
        await newContent.save();
        return res.status(201).json({
            result: newContent
        });
    } catch (err) {
        return res.status(500).json({
            result: err
        });
    }
});

// fetch content

router.get('/listContent', authCheck('Super Admin'), async (req, res, next) => {

    try {
        const contents = await Content.find();
        return res.status(200).json({
            contents: contents
        });
    } catch (err) {
        return res.status(500).json({
            contents: err
        });
    }


})

module.exports = router;
