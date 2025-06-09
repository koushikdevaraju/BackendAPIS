const mongoose = require('mongoose');
const billing = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Organization'
    }, invoice_no: {
        type: String, required: true
    }, billing_date: {
        type: Date, required: true  // optional: make this false if not always required
    }, billStatus: {
        type: String, enum: ['paid', 'unpaid']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('billing', billing);
