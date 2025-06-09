const mongoose = require('mongoose');

// Define the schema
const dummyProducts = new mongoose.Schema({
    product: {type: String, required: true}, // Name of the product
    quantity: {type: Number, required: true}, // Quantity of the product
    _id: {type: Number, required: true}, // Quantity of the product
    price: {type: Number, required: true},     // Price of the product
    tags: {
        type: [String], default: [], required: false
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});
module.exports = mongoose.model('dummyProducts', dummyProducts);
