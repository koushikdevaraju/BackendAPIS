const mongoose = require('mongoose');

const employee = new mongoose.Schema({
    name: {
        type: String, required: true
    }, email: {
        type: String, required: true
    }, department: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'department', default: []
    }], salary: {
        type: String, default: ''
    }, employeeId: {
        type: String, required: true, unique: true   // ✅ Suggestion: Add this to prevent duplicate IDs
    }, dateOfBirth: {
        type: Date, required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('employee', employee);
