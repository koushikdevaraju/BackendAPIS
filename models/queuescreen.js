const mongoose = require('mongoose');
const queueScreen = new mongoose.Schema({
    screenId: {
        type: mongoose.Schema.Types.ObjectId, required: true, ref: 'client'
    }, doctors: [{
        type: mongoose.Schema.Types.ObjectId, required: true, ref: 'doctor'
    }], organizationId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Organization'
    }, createdAt: {
        type: Date, default: Date.now()
    }
});

module.exports = mongoose.model('queueScreen', queueScreen);
