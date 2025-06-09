const express = require('express');
const router = express.Router();
const QueueScreen = require('../models/queuescreen');
const Queue = require('../models/queue');

router.post('/createQueueScreen', async (req, res, next) => {
    const body = req.body;
    try {
        const queueScreen = new QueueScreen(body);
        await queueScreen.save();
        return res.status(201).json({
            result: queueScreen
        });
    } catch (error) {
        return res.status(500).json({
            error: error
        });
    }
})


router.get('/getQueuescreen/:queueScreenId', async (req, res, next) => {
    const queueScreenId = req.params.queueScreenId;
    try {
        const queueScreen = await QueueScreen.findById(queueScreenId)
            .select('-createdAt')
            .populate({
                path: 'organizationId', select: ['name']
            })
            .populate({
                path: 'screenId', select: ['name', 'address', 'campaignId'], populate: {
                    path: 'campaignId', select: ['name', 'publishDate', 'endDate', 'media']
                }
            })
            .populate({
                path: 'doctors', select: ['name']
            });
        if (!queueScreen) {
            return res.status(404).json({
                error: 'Queue screen not found'
            });
        }
        const updatedData = await Promise.all(queueScreen.doctors.map(async (doctor) => {
            const doctorQueue = await Queue.find({
                doctor: doctor._id.toString(), organization: queueScreen.organizationId._id.toString()
            }).select('-updatedAt -createdAt -organization -doctor -date');
            return {
                ...doctor._doc, queue: doctorQueue
            }
        }));

        return res.status(200).json({
            queueScreen: {...queueScreen._doc, doctors: updatedData}
        });
    } catch (err) {
        return res.status(500).json({
            error: err
        });
    }
})


router.post('/addRemoveDoctor/:queueScreenId', async (req, res, next) => {

    const queueScreenId = req.params.queueScreenId;
    const doctorIds = req.body.doctorIds;
    const removeDoctor = req.body.removeDoctor;

    try {
        const queueScreen = await QueueScreen.findById(queueScreenId);
        if (!queueScreen) {
            return res.status(404).json({
                message: 'Queue screen not found'
            });
        }

        if (doctorIds.length > 0) {
            doctorIds.forEach(doctorId => {
                if (!queueScreen.doctors.includes(doctorId)) {
                    queueScreen.doctors.push(doctorId);
                }
            });
        }
        if (removeDoctor.length > 0) {
            removeDoctor.forEach(doctorId => {
                if (queueScreen.doctors.includes(doctorId)) {
                    queueScreen.doctors = queueScreen.doctors.filter((doctor) => {
                        return doctor._id.toString() !== doctorId;
                    })
                }
            })
        }

        await queueScreen.save();
        return res.status(200).json({
            result: queueScreen
        });
    } catch (err) {
        return res.status(500).json({
            error: err
        });
    }
});


module.exports = router;
