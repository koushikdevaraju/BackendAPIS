const express = require('express');
const router = express.Router();
const menuItem = require('../models/menuItem');
const authCheck = require('../middleware/authCheck');
const Users = require("../models/users");

router.post('/createItem', authCheck(['Admin', 'Super Admin']), async (req, res, next) => {
    try {
        await menuItem.findOne({
            itemName: req.body.itemName
        }).exec().then(async (item) => {
            if (!item) {
                const newItem = new menuItem({
                    itemName: req.body.itemName, price: req.body.price, menuId: req.body.menuId, addOns: req.body.addOns
                });
                await newItem.save();
                return res.status(201).json({
                    result: newItem
                })
            } else {
                return res.status(400).json({
                    'Error': 'Menu Item Already exists'
                })
            }
        })

    } catch (e) {
        return res.status(500).json({
            'Error': e
        })
    }
});

router.get('/fetchAllItems', authCheck(['Admin', 'Super Admin']), async (req, res, next) => {

    const page = req.query.page;
    const limit = req.query.limit;
    try {
        if (!page && !limit) {
            let menu_items = await menuItem.find().populate({
                path: 'menuId', select: ['menuCategory', 'menuName']
            }).exec();
            if (menu_items.length > 0) {
                menu_items = menu_items.map((item, index) => ({
                    slNumber: index + 1, ...item.toObject()
                }))
                return res.status(200).json({
                    menuItems: menu_items
                })
            }

            return res.status(404).json({
                message: 'Items not found'
            });
        }
        let menu_items = await menuItem.find()
            .skip(page * limit - 10).limit(limit).populate({
                path: 'menuId', select: ['menuCategory', 'menuName']
            }).exec();
        const totalRecords = await menuItem.countDocuments().exec();
        menu_items = menu_items.map((item, index) => ({
            slNumber: (page * limit - 10) + index + 1, ...item.toObject()
        }))
        if (menu_items.length > 0) {
            return res.status(200).json({
                menuItems: menu_items, totalPages: totalRecords, currentPage: page
            })
        }

        return res.status(404).json({
            message: 'Items not found'
        });
    } catch (error) {
        return res.status(500).json({
            message: error
        });
    }


});


//  add addOns

router.post('/add/addOns/:menuItemId', authCheck(['Admin', 'Super Admin']), async (req, res, next) => {

    try {
        await menuItem.findById(req.params.menuItemId).exec().then(async (menu_Item) => {

            if (!menu_Item) return res.status(400).json({
                message: 'MenuItem not found'
            });
            const check = await menu_Item.addOns.some(addOn => {
                return addOn.name === req.body.addOns.name
            });
            if (check) {
                return res.status(400).json({
                    message: 'AddOns already exists'
                });
            }
            menu_Item.addOns.push(req.body.addOns);
            await menu_Item.save();
            return res.status(200).json({
                message: 'AddOns updated'
            });
        }).catch(err => {
            return res.status(500).json({
                message: err
            });
        })
    } catch (error) {
        return res.status(500).json({
            message: error
        });
    }
});


router.post('/remove/addOns/:menuItemId/:addOnId', authCheck(['Admin', 'Super Admin']), async (req, res, next) => {
    try {
        await menuItem.findById(req.params.menuItemId).exec().then(async (menu_item) => {
            const check = await menu_item.addOns.filter(item => item._id.toString() === req.params.addOnId);
            if (check.length === 0) {
                return res.status(404).json({
                    message: 'AddOns not found'
                });
            }
            menu_item.addOns.pull(req.params.addOnId)
            await menu_item.save();
            return res.status(200).json({
                message: 'AddOns removed'
            });
        }).catch(err => {
            return res.status(500).json({
                message: err
            });
        })
    } catch (error) {
        return res.status(500).json({
            message: error
        });
    }
});


// TODO editing the addOns

router.post('/update/addOns/:menuItemId/:addOnId', authCheck(['Admin', 'Super Admin']), async (req, res, next) => {
    let name, quantity;
    if (req.body.name) name = req.body.name;
    if (req.body.quantity) quantity = req.body.quantity;

    try {
        await menuItem.findById(req.params.menuItemId).exec().then(async (menu_item) => {
            menu_item.addOns.map((item) => {
                if (item._id.toString() === req.params.addOnId) {
                    if (name) item.name = name;
                    if (quantity) item.quantity = quantity;
                }
            });
            await menu_item.save();
        });
        return res.status(200).json({
            message: 'AddOns details updated'
        });
    } catch (error) {
        return res.status(500).json({
            message: error
        });
    }
});


router.delete('/delete/:menuItemId', authCheck(['Admin', 'Super Admin']), (req, res, next) => {
    try {
        menuItem.findByIdAndDelete(req.params.menuItemId).exec().then(async (result) => {
            if (!result) {
                return res.status(404).json({
                    message: 'MenuItem not found'
                });
            }
            return res.status(200).json({
                message: 'MenuItem Deleted Successfully'
            });
        });
    } catch (error) {
        return res.status(500).json({
            message: error
        });
    }
});


router.patch('/update/:menuItemId', authCheck(['Super Admin', 'Admin']), async (req, res, next) => {
    const body = req.body;
    try {
        await menuItem.findByIdAndUpdate(req.params.menuItemId, {
            $set: body
        }).exec().then(async (result) => {
            if (!result) {
                return res.status(404).json({
                    message: 'MenuItem not found'
                });
            }
            return res.status(200).json({
                message: 'MenuItem Updated Successfully'
            });
        }).catch(err => {
            return res.status(500).json({
                message: err
            });
        });
    } catch (e) {
        return res.status(500).json({
            message: e
        });
    }
});


router.get('/getAddons/:addOnsId', authCheck(['Super Admin', 'Admin']), async (req, res, next) => {
    try {
        const addOnsId = req.params.addOnsId;
        const menu_Item = await menuItem.findOne({addOns: {$elemMatch: {_id: addOnsId}}}).exec();
        if (!menu_Item) return res.status(404).json({message: 'Item not found'});
        const addOns = menu_Item.addOns.find((addon) => {
            return addon._id.toString() === addOnsId;
        });
        if (!addOns) {
            return res.status(404).json({message: 'AddOns not found'});
        }
        return res.status(200).json({
            message: addOns
        });
    } catch (e) {
        return res.status(500).json({
            message: e
        });
    }
});

module.exports = router;
