const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Users = require('../models/users');
const OTP = require('../models/otp');
const bcrypt = require('bcryptjs');
const Organization = require('../models/organization');
router.post('/', async (req, res, next) => {
    await Users.findOne({
        email: req.body.email
    }).select('-userType')
        .exec().then(async (user) => {
            if (!user) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Authentication failed'
                    })
                }
                if (result) {
                    const token = jwt.sign({
                        email: user.email, userId: user._id.toString()
                    }, process.env.JWTPrivateKey, {
                        expiresIn: "30d"
                    });
                    const renewAccessToken = jwt.sign({
                        email: user.email, userId: user._id.toString()
                    }, process.env.JWTPrivateKey, {
                        expiresIn: "365d"
                    });

                    return res.status(200).json({
                        message: 'Authentication Success', token: token, renewAccessToken: renewAccessToken, data: user
                    });
                }
                return res.status(401).json({
                    message: 'Auth failed'
                });
            });
        });
});

// login with phone number

router.post('/loginPhone', (req, res, next) => {
    const number = req.body.number;
    if (!number.includes('+91')) {
        return res.status(400).json({
            error: 'Include Country code in your Phone Number'
        });
    }
    Users.findOne({phoneNumber: number}).exec().then(async (user) => {
        if (!user) {
            const newUser = new Users({
                name: '', email: '', password: '', role: 'User', userType: 'Patient', phoneNumber: req.body.number,
            });
            await newUser.save();
            const otp = new OTP({
                number: req.body.number,
                otp: Math.floor(100000 + Math.random() * 900000),
                userId: newUser._id.toString()
            });
            await otp.save();
            return res.status(200).json({
                message: 'New User', user: newUser._id.toString()
            });
        }
        const otp = new OTP({
            number: req.body.number, otp: Math.floor(100000 + Math.random() * 900000), userId: user._id.toString()
        });
        await otp.save();
        return res.status(200).json({
            message: 'Existing User', user: user._id.toString()
        });
    }).catch(err => {
        return res.status(500).json({
            error: err
        });
    });
});

router.post('/verifyOtp', (req, res, next) => {
    const number = req.body.number;
    const otp = req.body.otp;

    if (!number.includes('+91')) {
        return res.status(400).json({
            error: 'Include Country code in your Phone Number'
        });
    }
    if (otp.length !== 6) {
        return res.status(400).json({
            message: 'Enter 6 digit otp'
        });
    }

    OTP.findOne({otp: otp}).exec().then(async (response) => {
        if (!response) {
            return res.status(400).json({
                message: 'Wrong OTP'
            });
        }
        const token = jwt.sign({
            number: req.body.number, userId: response.userId.toString()
        }, process.env.JWTPrivateKey, {
            expiresIn: '30d'
        });
        const renewAccessToken = jwt.sign({
            number: req.body.number, userId: response.userId.toString()
        }, process.env.JWTPrivateKey, {
            expiresIn: '30d'
        });
        await OTP.findByIdAndDelete(otp._id.toString()).exec();
        return res.status(200).json({
            message: 'Authentication Success',
            token: token,
            renewAccessToken: renewAccessToken,
            userId: response.userId.toString()
        });
    });

})

module.exports = router;
