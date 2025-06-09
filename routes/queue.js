const express = require('express');
const router = express.Router();
const Queue = require('../models/queue');

router.post('/createQueue', async (req, res, next) => {
    try {
        const queue = await Queue.find({organization: req.body.organization, doctor: req.body.doctor});
        let position = queue.length + 1;

        const newQueue = new Queue({
            doctor: req.body.doctor,
            organization: req.body.organization,
            position: position,
            user: req.body.user || null,
            patientName: req.body.patientName || '',
            queueStatus: 'active'
        });
        await newQueue.save();

        return res.status(201).json({
            message: 'Queue is created', queue: newQueue
        });
    } catch (err) {
        return res.status(500).json({
            error: err
        });
    }

});



module.exports = router;
