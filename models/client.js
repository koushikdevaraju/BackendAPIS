const mongoose = require('mongoose');
const client = new mongoose.Schema({
    name: {
        type: String, required: true
    }, address: {
        type: String, required: true
    }, campaignId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'campaign', default: null
    }, createdAt: {
        type: Date, default: Date.now()
    }, organization: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null
    }, status: {
        type: Boolean, default: true
    }
});

module.exports = mongoose.model('client', client);
