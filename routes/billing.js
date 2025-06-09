const express = require('express');
const router = express.Router();
const Billing = require('../models/billing');
const moment = require('moment');

function generateRandomAlphanumeric(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}

router.post('/createBill', async (req, res, next) => {
    try {
        const {organization, billing_date, billStatus} = req.body;
        if (!organization) {
            return res.status(400).json({
                response: 'Invalid bill details'
            });
        }

        const invoice_no = generateRandomAlphanumeric().toUpperCase();
        const newBill = new Billing({
            organization, invoice_no, billing_date, billStatus
        });
        await newBill.save();
        return res.status(201).json({
            response: newBill
        });
    } catch (err) {
        return res.status(500).json({
            response: err, message: 'Internal Server Error'
        });
    }
});


router.get('/billData/:billId', async (req, res, next) => {
    const {billId} = req.params;

    try {
        if (!billId) {
            return res.status(404).json({
                message: 'Pass the bill id'
            });
        }
        const billRecord = await Billing.findById(billId).populate({
            path: 'organization', select: ['name', 'address']
        })
        if (!billRecord) {
            return res.status(404).json({
                message: 'No Bills found'
            });
        }
        return res.status(200).json({
            billRecord
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});


router.delete('/clearBill', async (req, res, next) => {

    try {
        const clearResult = await Billing.deleteMany({});
        const {deletedCount} = clearResult;
        if (deletedCount === 0) {
            return res.status(404).json({
                message: 'No Bills found to clear'
            });
        }
        return res.status(200).json({
            message: 'All Bills cleared', clearResult
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Internal Server Error', err
        });
    }
})


router.patch('/updateBill/:billId', async (req, res, next) => {
    const {billId} = req.params;

    let queryBody;
    for (const key in req.body) {
        if (key === 'billing_date') {
            const checkValid = moment(req.body[key]).isBefore(moment(new Date()));
            if (checkValid) {
                return res.status(400).json({
                    message: 'Provide only the future date for the bill_due_date update'
                });
            } else {
                queryBody = {...queryBody, [key]: req.body[key]};
            }
        } else {
            queryBody = {...queryBody, [key]: req.body[key]};
        }
    }
    try {
        const billRecord = await Billing.findById(billId);
        if (!billRecord) {
            return res.status(404).json({
                message: 'Bill not found'
            });
        }

        if (billRecord && billRecord.billStatus === 'paid') {
            return res.status(400).json({
                message: 'The bill has already been paid'
            });
        }
        const updateResult = await Billing.updateMany({_id: billId,}, queryBody);
        const {modifiedCount} = updateResult;

        if (modifiedCount === 0) {
            return res.status(500).json({
                message: 'Bill details update failed', updateResult
            });
        }
        return res.status(200).json({
            message: 'Bill updated ', updateResult
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Internal Server Errors ', err
        });
    }
});


router.get('/daterange/:startDate/:endData', async (req, res, next) => {

    const {startDate, endData} = req.params;
    try {
        if (endData < startDate) {
            return res.status(400).json({
                message: 'End date should be later than the start date.'
            });
        }
        const start = new Date(startDate);
        const end = new Date(endData);

        const responseResult = await Billing.find({
            createdAt: {
                $gte: start, $lte: end
            }
        }).populate({
            path: 'organization', select: ['name']
        }).select('-updatedAt -createdAt -__v');

        return res.status(200).json({
            responseResult: responseResult, start, end
        });
    } catch (e) {

    }
})


module.exports = router;
