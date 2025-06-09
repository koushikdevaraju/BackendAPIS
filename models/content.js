const mongoose = require('mongoose');
const Content = mongoose.Schema({
    contentName: {
        type: String, default: '', required: true
    }, additionalData: [{
        content: {
            type: String, required: true,
        }
    }], status: {
        type: Boolean, require: false,
    },

});
module.exports = mongoose.model('content', Content);
