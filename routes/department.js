const express = require('express');
const router = express.Router();
const Department = require('../models/department');

router.post('/createDepartment', async (req, res, next) => {

    const {name, location} = req.body;
    try {

        const isDepartmentExists = await Department.findOne({name});
        if (isDepartmentExists) {
            return res.status(400).json({
                message: 'Department already exists'
            });
        }

        const newDepartment = new Department({
            name, location
        });

        await newDepartment.save();
        return res.status(201).json({
            newDepartment
        });

    } catch (error) {
        return res.status(500).json({
            error
        });
    }
});


module.exports = router;
