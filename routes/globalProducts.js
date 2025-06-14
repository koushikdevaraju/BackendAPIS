const express = require('express');
const router = express.Router();
const Product = require('../models/globalProducts');
const mongoose = require('mongoose');

router.post('/createGlobalProduct', async (req, res, next) => {
    const {
        cost, name, products = []
    } = req.body;

    try {
        const isProductExists = await Product.findOne({name});
        if (isProductExists) {
            return res.status(400).json({
                message: 'Product already exists'
            });
        }

        const newProduct = new Product({
            cost, name, products
        });
        await newProduct.save();
        return res.status(201).json({
            newProduct
        });
    } catch (error) {
        return res.status(500).json({
            message: error
        });
    }

})

router.post('/pharmacyProduct', async (req, res, next) => {
    const {
        productName, stock, globalProductId, price, organizationId
    } = req.body;

    try {
        const isGlobalProdExists = await Product.findById(globalProductId);

        if (!isGlobalProdExists) {
            return res.status(404).json({message: 'Global product not found'});
        }

        if (isGlobalProdExists.products.length > 0) {
            const checkProduct = isGlobalProdExists.products.find(prd => prd.productName === productName);
            if (checkProduct) {
                return res.status(400).json({
                    message: 'Product Already exits'
                });
            }
            isGlobalProdExists.products.push({
                productName, stock, globalProductId, price, organizationId
            });
            await isGlobalProdExists.save();

            return res.status(201).json({
                isGlobalProdExists
            });
        }

        isGlobalProdExists.products.push({
            productName, stock, globalProductId, price, organizationId
        });
        await isGlobalProdExists.save();

        return res.status(201).json({
            isGlobalProdExists
        });
    } catch (error) {
        return res.status(500).json({
            error
        })
    }

});

router.get('/getProds/:organizationId', async (req, res, next) => {
    const {organizationId} = req.params;
    try {
        // const products = await Product.find(query);
        const products = await Product.aggregate([{
            $addFields: {
                products: {
                    $filter: {
                        input: "$products", as: "prod", cond: {
                            $and: [{
                                $eq: ['$$prod.organizationId', new mongoose.Types.ObjectId(organizationId)],
                            }]
                        }
                    }
                }
            }
        }, {
            $match: {
                'products.0': {$exists: true}
            }
        }]);


        if (products && products.length === 0) {
            return res.status(404).json({
                message: 'Products not found'
            });
        }

        const fetchedProds = products.map(prd => prd.products).reduce((acc, cur) => {
            return [...acc, ...cur];
        }, []);

        return res.status(200).json({
            fetchedProds
        });
    } catch (error) {
        return res.status(500).json({
            error
        });
    }

})


// HI i want commit checks


module.exports = router;
