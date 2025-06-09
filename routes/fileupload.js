const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/users');
const organization = require('../models/organization');
const csv = require('csvtojson');
const pwdHash = require('../middleware/pwdhash');
const moment = require('moment-timezone');
const bcrypt = require('bcryptjs');


// Set storage engine for multer
const storage = multer.diskStorage({
 filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage});

router.post('/uploadUsers/:orgId', pwdHash, upload.single('userCSV'), async (req, res, next) => {
    const orgId = req.params.orgId;
    const org = await organization.findById(orgId);
    const jsonArr = await csv().fromFile(req.file.path);

    if (jsonArr.length === 0) return res.status(400).json({
        error: 'Dont\'s upload empty csv file'
    });

    if (req.file.mimetype !== 'text/csv') return res.status(400).json({
        error: 'upload Only CSV files'
    })

    for (const user of jsonArr) {
        let userNumber = '';
        if (user.phoneNumber.length === 10 && !user.phoneNumber.startsWith('+91')) {
            userNumber = '+91' + user.phoneNumber;
        }
        if (user.phoneNumber.length === 12 && !user.phoneNumber.startsWith('+')) {
            userNumber = '+' + user.phoneNumber;
        }
        if (user.phoneNumber.length === 13 && user.phoneNumber.startsWith('+')) {
            userNumber = user.phoneNumber;
        }

        const existingUser = await User.findOne({phoneNumber: userNumber});
        if (existingUser) {
            if (!existingUser.organization.includes(orgId)) {
                existingUser.organization.push(orgId);
                await existingUser.save();
            }
            continue;
        }

        const hashedPassword = await bcrypt.hash(user.password, 10);
        // const dob = user.dateOfBirth ? moment(user.dateOfBirth, 'DD-MM-YYYY').format() : null;
        const dob = moment(data.dateOfBirth, 'DD-MM-YYYY').tz('Asia/Kolkata').toDate();

        const newUSer = new User({
            name: user.name,
            email: user.email,
            password: hashedPassword,
            role: user.role,
            userType: user.userType,
            phoneNumber: userNumber,
            IHINumber: user.IHINumber,
            address: user.address || '',
            organization: req.params.orgId,
            dateOfBirth: dob || null
        });
        try {
            await newUSer.save();
        } catch (error) {
            return res.status(500).json(error);
        }
    }
    return res.status(200).json({
        message: 'Users Details uploaded'
    })
})

module.exports = router;
