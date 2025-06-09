const mongoose = require('mongoose');

const menus = mongoose.Schema({
    menuName: {
        type: String, required: true, default: ''
    }, menuCategory: [{
        enum: ['Veg', 'Non-Veg', 'Vegan'], type: String, required: true
    }], organizationId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true
    }
});

module.exports = mongoose.model('Menus', menus);
