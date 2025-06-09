const express = require('express');
const router = express.Router();
const path = require('path');
const utils = require('../utils/path')

router.get('/', (req, res, next) => {
    res.sendFile(path.join(utils, 'templates', 'shop.html'));
});

module.exports = router;
