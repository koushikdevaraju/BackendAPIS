const express = require('express');
const router = express.Router();
const User = require('../models/users');
const mongoose = require('mongoose');

router.post('/transaction', async (req, res, next) => {

    const {amount, fromUserId, toUserId} = req.body;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // deduct amount from sender party

        await User.updateOne({_id: fromUserId}, {
            $inc: {
                amount: -amount
            }
        }, {
            session
        });


        // update amount to receiver party

        await User.updateOne({_id: toUserId}, {
            $inc: {
                amount: amount
            }
        }, {
            session
        });

        await session.commitTransaction();
        await session.endSession();
        return res.status(200).json({success: true, message: "Transfer successful"});

    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(500).json({
            error
        })
    } finally {
        await session.endSession();
    }

});

module.exports = router;
