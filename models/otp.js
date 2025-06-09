const moongose = require('mongoose');
const Otp = moongose.Schema({
    number: {
        type: String, required: true
    }, otp: {
        type: String, required: true
    }, userId: {
        ref: 'Users', type: moongose.Schema.Types.ObjectId, required: true
    }
});

module.exports = moongose.model('Otps', Otp);
