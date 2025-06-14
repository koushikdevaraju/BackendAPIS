const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Doctor = require('../models/doctor');
const Organization = require('../models/organization');
const Dummy_doctor = require('../models/dummy_doctor');
const pwdhash = require('../middleware/pwdhash');
const authCheck = require('../middleware/authCheck');
const moment = require('moment');
const mongoose = require("mongoose");

router.post('/create', pwdhash, async (req, res) => {
    const userType = req.body.userType;

    try {

        if (userType === 'Doctor') {
            const doctor = await Doctor.findOne({
                phoneNumber: req.body.phoneNumber
            });
            if (doctor) {
                return res.status(400).json({
                    message: 'User already exits'
                });
            }
            const newDoctor = new Doctor({
                name: req.body.name,
                email: req.body.email,
                password: req.pwdhash,
                role: 'User',
                userType: 'Doctor',
                phoneNumber: req.body.phoneNumber,
                address: req.body.address || '',
                organization: req.body.organization,
                status: true
            });

            await newDoctor.save();
            return res.status(201).json({
                newDoctor: newDoctor, message: 'Doctor is created'
            });
        }

        const userExists = await User.findOne({phoneNumber: req.body.phoneNumber});
        if (userExists) {
            return res.status(400).json({
                message: 'User already exits'
            });
        }

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.pwdhash,
            role: req.body.role,
            userType: req.body.userType,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address || '',
            organization: req.body.organization,
            status: true
        });

        await newUser.save();
        return res.status(201).json({
            newUser: newUser
        });

    } catch (err) {
        return res.status(500).json({
            message: err
        });
    }
});

router.get('/:userId', async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const userFound = await User.findById(userId).populate({
            path: 'dependents', select: ['name']
        });
        if (!userFound) {
            const doctorFound = await Doctor.findById(userId)
                .populate({
                    path: 'organization', select: ['name']
                })

            if (!doctorFound && !userFound) {
                return res.status(404).json({
                    message: 'User not found'
                })
            }
            return res.status(200).json({
                user: doctorFound
            });
        }

        return res.status(200).json({
            user: userFound
        });
    } catch (err) {
        return res.status(500).json({
            message: err
        });
    }


})

router.get('/getUsers/:userType/:orgId', async (req, res, next) => {
    const userType = req.params.userType;
    const orgId = req.params.orgId;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    try {

        if (userType === 'Doctor') {
            if (!page && !limit) {
                const users = await Doctor.find().select('name email phoneNumber');

                if (users.length === 0) {
                    return res.status(404).json({
                        message: 'Users not found'
                    });
                }
                return res.status(200).json({
                    response: users
                });
            }


            const users = await Doctor.find({organization: orgId})
                .skip((page * limit) - limit)
                .limit(limit)
                .select('name email phoneNumber organization');

            const result = users.map((user, index) => ({
                ...user._doc, slNumber: ((page * limit) - limit) + (index + 1)
            }))

            if (result.length === 0) {
                return res.status(404).json({
                    message: 'Users not found'
                });
            }
            return res.status(200).json({
                response: result, currentPage: page, totalPages: await Doctor.countDocuments()
            });
        }

        const users = await User.find().select('name email phoneNumber');
        if (users.length === 0) {
            return res.status(404).json({
                message: 'Users not found'
            });
        }
        return res.status(200).json({
            response: users
        });
    } catch (err) {
        return res.status(500).json({
            message: err
        });
    }


})

router.post('/addOrganization/:userId', async (req, res, next) => {

    const userId = req.params.userId;
    const orgIds = req.body.orgIds;

    try {
        const doctor = await Doctor.find({
            organization: {
                $all: orgIds
            }
        });
        if (!doctor) {
            return res.status(404).json({
                doctor: 'doctor not found'
            });
        }
        // orgIds.forEach(id => {
        //     if (!doctor.organization.includes(id)) {
        //         doctor.organization.push(id);
        //     }
        // });
        // await doctor.save();
        return res.status(200).json({
            doctor: doctor
        });
    } catch (error) {
        return res.status(500).json({
            doctor: doctor
        });
    }
});

router.post('/doctors/:highestOne', async (req, res, next) => {
    try {
        const doctors = await Dummy_doctor.find().sort({age: -1});

        if (Number(req.params.highestOne) <= 0) {
            return res.status(400).json({error: 'invalid range'}); // Return the error message
        }

        if (Number(req.params.highestOne) > doctors.length) {
            return res.status(400).json({error: 'Range exceeded'}); // Return the error message
        }
        return res.status(200).json({
            'result': doctors[Number(req.params.highestOne) - 1]
        }); // Return the list of doctors
    } catch (error) {
        return res.status(500).json({error: error.message}); // Return the error message
    }
});

router.post('/create/dependent/:parentId', pwdhash, async (req, res, next) => {
    const parentId = req.params.parentId;
    const dependentName = req.body.name;

    try {
        const findParent = await User.findById(parentId);
        if (!findParent) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        const findDependent = await User.findOne({name: dependentName, status: true});
        if (findParent.dependents.length === 0) {
            const result = await createDependent(req, findParent);
            findParent.dependents.push(result.toObject()._id);
        } else {
            if (findDependent) {
                return res.status(400).json({
                    message: 'Dependent already exists'
                });
            }
            const result = await createDependent(req, findParent);
            findParent.dependents.push(result.toObject()._id);
        }
        findParent.save();
        return res.status(200).json({
            message: 'Dependent created', result: findParent
        });
    } catch (err) {
        return res.status(500).json({
            message: err
        });
    }


});

router.patch('/:userId', async (req, res, next) => {
    const userId = req.params.userId;

    try {
        // Attempt to update the user
        const findUser = await User.findById(userId);
        if (!findUser) {
            return res.status(404).json({
                message: 'User not found'
            })
        }
        const updateResult = await User.updateOne({_id: userId}, req.body);
        if (updateResult.modifiedCount === 0) {
            return res.status(400).json({
                message: 'No changes made to the user details'
            });
        }

        return res.status(200).json({
            message: 'User details updated successfully'
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Internal server error', error: err.message
        });
    }
});


router.get('/', async (req, res, next) => {

    try {
        const doctorData = await Dummy_doctor.aggregate([{
            $group: {
                _id: "$organization", doctorCount: {
                    $sum: 1
                }
            }
        }, {
            $sort: {doctorCount: 1}
        }])
        return res.status(200).json({
            message: doctorData
        });
    } catch (err) {
        return res.status(500).json({
            message: err
        })
    }

});


router.get('/fetchUser/name', async (req, res, next) => {

    try {
        const {name, phoneNumber} = req.query;
        if (name) {
            const regexFind = new RegExp(name, 'g');
            const findUser = await User.find({name: regexFind});
            if (!findUser) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                result: findUser
            });
        }
        if (phoneNumber) {
            const regexFind = new RegExp(phoneNumber, 'i');
            const findUser = await User.findOne({phoneNumber: regexFind});
            if (!findUser) {
                return res.status(404).json({
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                result: findUser
            });
        }


    } catch (error) {
        return res.status(500).json({
            error: error
        });
    }
});


router.post('/migrate/amountZero', async (req, res, next) => {

    const {userIds, amount} = req.body;

    try {
        const userUpdate = await User.updateMany({}, {
            $set: {
                amount: amount
            }
        });
        if (!userUpdate) {
            return res.status(400).json({
                message: 'migration failed'
            });
        }
        return res.status(200).json({
            userUpdate
        });

    } catch (err) {
        return res.status(500).json({
            err
        });
    }


})


async function createDependent(req, findParent) {
    const newDependent = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.pwdhash,
        role: req.body.role,
        userType: req.body.userType,
        phoneNumber: req.body.name + findParent.phoneNumber,
        address: req.body.address || '',
        organization: req.body.organization,
        status: true
    });
    return await newDependent.save();
}

// welcome one board new Route to backEnd


module.exports = router;
