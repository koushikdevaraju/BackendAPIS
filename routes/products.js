const express = require('express');
const router = express.Router();
const product = require('../models/products');
router.post('/createProduct', async (req, res, next) => {
    try {

        // const productExists = await product.findOne({productName: req.body.productName});
        // if (productExists) return res.status(400).json({
        //     error: 'Product Already exits'
        // });

        const newProduct = new product({
            productName: req.body.productName,
            quantity: req.body.quantity,
            price: parseFloat(req.body.price),
            type: req.body.type,
            organization: req.body.organization || null
        });
        await newProduct.save();
        return res.status(201).json({
            product: newProduct
        });
    } catch (e) {
        return res.status(500).json({
            error: e
        });
    }
});

router.get('/listProd', async (req, res, next) => {

    const group = [{
        $group: {
            _id: "$productName", totalQuantity: {
                $sum: "$quantity"
            }, totalRevenue: {
                $sum: {
                    $multiply: ['$quantity', '$price']
                }
            }
        }
    }];
    // const sort = [{
    //     $sort: {
    //         price: 1
    //     }
    // }];
    // const match = [{$match: {price: {$lte: 10}}}]
    // const products = await product.aggregate(match);
    // const project = [{
    //     $project: {
    //         productName: 1, totalCost: {$multiply: ["$price", "$quantity"]}, // Add totalCost field
    //     }
    // }]
    // const products = await product.aggregate(group);
    const products = await product.aggregate(group);
    // let results = [];
    // for (const prod of products) {
    //     results.push({
    //         productName: prod._id, totalQuantity: prod.totalQuantity
    //     })
    // }
    return res.json({
        products: products
    }).status(200);
});

module.exports = router;
