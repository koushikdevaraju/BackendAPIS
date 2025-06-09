const mongoose = require('mongoose');
const PostSchema = new mongoose.Schema({
    title: {
        type: String, default: ''
    }, content: {
        type: String, default: ''
    }, placeVisit: [{
        placeName: {
            type: String, default: ''
        }, landMark: {
            type: String, default: ''
        }
    }], status: {
        type: Boolean, default: false
    }, userId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: false, default: null
    }
});

module.exports = mongoose.model('Posts', PostSchema);
