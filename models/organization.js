const mongoose = require('mongoose');

const organization = new  mongoose.Schema({
    name: {
        type: String, default: '', required: true
    }, address: {
        type: String, default: '', required: false
    }, primaryColor: {
        type: String, default: '', required: false
    }, secondaryColor: {
        type: String, default: '', required: false
    }, url: {
        type: String, required: true
    }
});

module.exports = mongoose.model('Organization', organization);
