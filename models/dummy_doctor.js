const mongoose = require('mongoose');
const dummy_doctor = new mongoose.Schema({
    name: {
        type: String, default: ''
    }, specialization: [{
        type: String, default: ''
    }], age: {
        type: Number, default: ''
    }, organization: {
        type: String, default: ''
    }
});

module.exports = mongoose.model('dummy_doctors', dummy_doctor);
