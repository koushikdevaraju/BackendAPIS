const express = require('express');
const router = express.Router();
const Employee = require('../models/employee');

router.post('/createEmployee', async (req, res, next) => {
    const {
        name, department, salary, dateOfBirth, email
    } = req.body;

    try {
        const isEmployeeExists = await Employee.findOne({name});
        if (isEmployeeExists) {
            return res.status(400).json({
                message: 'Employee already exists'
            });
        }
        const employeeId = Math.floor(100000 + Math.random() * 999999).toString();
        const newEmployee = new Employee({
            name, department, salary, dateOfBirth, employeeId, email
        });
        await newEmployee.save();
        return res.status(201).json({
            newEmployee
        });

    } catch (error) {
        return res.status(500).json({
            error
        });
    }
});


router.get('/aggregations', async (req, res, next) => {
    try {

        // $sort is for sorting via property value 1 (asc) or -1 (desc)
        // $skip for skip current one and move to next one
        // $limit case to fetch n records on certain condition
        // $project exclude (0) or Include (1) property via 0 and 1

        const result = await Employee.aggregate([{$sort: {salary: -1}}, {$skip: 1}, {$limit: 1}, {
            $project: {
                name: 1, salary: 1
            }
        }]);
        return res.status(200).json({
            result
        });
    } catch (error) {
        return res.status(500).json({
            error
        })
    }
});


router.get('/groupByDepartment', async (req, res, next) => {
    try {
        const result = await Employee.aggregate([//     {
            //     $unwind: "$department" // Unwind array to group properly
            // },

            {
                $group: {
                    _id: "$salary", // Group by department ObjectId
                    employeeCount: {$sum: 1}, // Count employees in each department
                }
            },

            //     {
            //     $lookup: {
            //         from: "departments", // Make sure this matches your collection name
            //         localField: "_id", foreignField: "_id", as: "departments"
            //     }
            // },  {
            //     $unwind: "$departments"
            // },
            //     {
            //         $project: {
            //             _id: 0,
            //             department: "$departments.name",
            //             employeeCount: 1
            //         }
            //     }
        ]);
        return res.status(200).json({
            result
        });
    } catch (error) {
        return res.status(500).json({
            error
        });
    }

});


router.post('/addRemoveDepartment/:empId', async (req, res, next) => {

    const {add_departmentIds = [], remove_departmentIds = []} = req.body;
    const {empId} = req.params
    try {
        const employeeId = await Employee.findById(empId);
        // add operation
        if (add_departmentIds.length > 0) {
            add_departmentIds.forEach(ele => {
                if (!employeeId._doc.department.includes(ele)) {
                    employeeId._doc.department.push(ele);
                }
            });
        }
        // remove operation
        if (remove_departmentIds.length > 0) {
            remove_departmentIds.forEach(ele => {
                if (employeeId._doc.department.includes(ele)) {
                    employeeId._doc.department = employeeId._doc.department.filter(item => item._id.toString() !== ele);
                }
            });
        }
        await employeeId.save();
        return res.status(200).json({
            employeeId
        });
    } catch (error) {
        return res.status(500).json({
            error
        });
    }
})

module.exports = router;
