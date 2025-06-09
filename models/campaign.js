const mongoose = require('mongoose');
const campaign = new mongoose.Schema({
    name: {
        type: String, required: true
    }, publishDate: {
        type: Date, required: true
    }, endDate: {
        type: Date, required: true
    }, media: [{
        position: {
            type: Number
        }, mediaType: {
            type: String
        }
    }], createdAt: {
        type: Date, default: Date.now()
    }
});

module.exports = mongoose.model('campaign', campaign);
