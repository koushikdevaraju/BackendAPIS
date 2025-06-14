const mongoose = require('mongoose');
const globalProducts = new mongoose.Schema({
    name: {
        type: String, default: ''
    }, cost: {
        type: Number, required: true, default: 0
    }, products: [{
        productName: {
            type: String, default: ''
        }, stock: {
            type: Number, default: 0
        }, globalProductId: {
            type: String, required: true
        }, price: {
            type: Number, default: 0
        }, organizationId: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true
        }
    }]
}, {timestamps: true});

module.exports = mongoose.model('globalProduct', globalProducts);
