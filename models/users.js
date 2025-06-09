const mongoose = require('mongoose');
const user = new mongoose.Schema({
    name: {
        type: String, default: '',
    }, email: {
        type: String, default: '',
    }, password: {
        type: String, default: '',
    }, address: {
        type: String, default: '',
    }, phoneNumber: {
        type: String, default: '', required: true, unique: true
    }, userType: {
        type: String, default: 'Patient', required: true
    }, organization: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true
    }], IHINumber: {
        type: String, default: ''
    }, role: {
        type: String, default: 'User', required: true
    }, avatar: {
        type: String, default: null
    }, dateOfBirth: {
        type: Date, default: null
    }, status: {
        type: Boolean, default: false
    }, dependents: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true
    }], amount: {
        type: Number, required: 0, default: 0
    }
});

module.exports = mongoose.model('user', user);
