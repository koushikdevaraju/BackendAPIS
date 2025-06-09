const express = require('express');
const router = express.Router();
const Menus = require('../models/menus');
const Organization = require('../models/organization');

router.post('/create', (req, res, next) => {

    try {
        Menus.findOne({menuName: req.body.menuName, organizationId: req.body.organizationId}).exec().then((menu) => {
            if (!menu) {
                Menus.create({
                    menuName: req.body.menuName,
                    menuCategory: req.body.menuCategory,
                    organizationId: req.body.organizationId
                }).then((menu) => {
                    return res.status(201).json(menu);
                }).catch((error) => {
                    res.status(500).json(error)
                });
            } else {
                return res.status(400).json({
                    message: 'Menu Already exists!'
                });
            }
        });

    } catch (e) {
        res.status(500).json(e)
    }
});

// list menus
router.get('/', (req, res, next) => {

    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    Menus.find().skip((page - 1) * limit).limit(limit).populate({
        path: 'organizationId', select: ['name', 'address']
    }).exec().then(async (menus) => {

        Menus.countDocuments().then((total) => {
            const result = menus.map((item, index) => ({
                slNumber: (page - 1) * page + index + 1, ...item.toObject()
            }));
            return res.status(200).json({
                menus: result, totalRecords: total, totalPages: Math.ceil(total / limit)
            });
        });

    }).catch(err => {
        return res.status(500).json(err);
    })
});

// get menu based on organization

router.get('/listmenus/:orgId', (req, res, next) => {
    Menus.find({
        organizationId: req.params.orgId
    }).populate({
        path: 'organizationId', select: ['name', 'address']
    }).exec().then((list) => {
        if (list.length > 0) {
            return res.status(200).json({
                list: list
            })
        }
        return res.status(404).json({
            error: 'No menu for this organization'
        });
    }).catch(err => {
        return res.status(500).json({
            error: err
        });
    })
});

router.delete('/removeMenu/:menuId', (req, res, next) => {
    Menus.findOneAndDelete({
        _id: req.params.menuId
    }).exec().then((response) => {
        if (!response) {
            return res.status(404).json({
                response: 'Menu not found'
            })
        }
        return res.status(200).json({
            response: response
        })
    });
})


module.exports = router;
