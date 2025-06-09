const moongose = require('mongoose');
const Menus = require('./menus');
const MenuItem = moongose.Schema({
    itemName: {
        type: String, required: true, default: ''
    }, price: {
        type: Number, required: true
    }, menuId: {
        type: moongose.Schema.Types.ObjectId, required: true, ref: 'Menus'
    }, addOns: [{
        name: {
            type: String, default: '',
        }, quantity: {
            type: Number, default: 0
        }
    }]
});

module.exports = moongose.model('menuItems', MenuItem);
