const mongoose = require('mongoose');
const queue = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true
    }, user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null
    }, patientName: {
        type: String, default: '', required: false
    }, organization: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true
    }, date: {
        type: Date, default: Date.now()
    }, position: {
        type: Number, required: false, default: 0
    }, queueStatus: {
        type: String, default: 'active', enum: ['active', 'completed']
    },
}, {timestamps: true});
module.exports = mongoose.model('queue', queue);
