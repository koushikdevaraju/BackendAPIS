const mongoose = require('mongoose');

const restaurant = new mongoose.Schema({
    name: {
        type: String, default: '', required: true
    }, address: {
        type: String, required: true
    }, restaurantType: {
        type: String, enum: ['Veg', 'Non-Veg', 'Vegan']
    }, available: {
        type: Boolean, default: false
    }, createdAt: {
        type: Date, default: Date.now()
    }
});

module.exports = mongoose.model('restaurant', restaurant);
