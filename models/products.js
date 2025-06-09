const mongoose = require('mongoose');

const Product = new mongoose.Schema({
    productName: {
        type: String, default: '', required: true
    }, quantity: {
        type: Number, default: 0, required: true
    }, type: {
        type: String, default: '', required: true
    }, price: {
        type: Number, default: 0, required: true
    }, organization: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null, required: false
    }
});

module.exports = mongoose.model('product', Product);
