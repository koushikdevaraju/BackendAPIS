const mongoose = require('mongoose');
const doctor = new mongoose.Schema({
    name: {
        type: String, default: '',
    }, email: {
        type: String, default: '',
    }, phoneNumber: {
        type: String, default: '', required: true, unique: true
    }, password: {
        type: String, default: '',
    }, userType: {
        type: String, default: 'Doctor', required: true
    }, role: {
        type: String, default: 'User', required: true
    }, status: {
        type: Boolean, default: false
    }, organization: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Organization'
    }]
});

module.exports = mongoose.model('doctor', doctor);
