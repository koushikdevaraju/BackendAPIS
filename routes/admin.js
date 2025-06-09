const express = require('express');
const router = express.Router();
const path = require('path');
const utils = require('../utils/path')
router.get('/add-product', (req, res) => {
    res.sendFile(path.join(utils, 'templates', 'admin.html'));
});

router.post('/create', (req, res, next) => {
    console.log(req.body);
    res.redirect('/');
})


module.exports = router;
