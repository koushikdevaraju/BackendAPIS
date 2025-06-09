const bcrypt = require('bcryptjs');
const hashedPass = async function(req, res, next) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash){
            req.pwdhash = hash;
            next();
        })
    });
}

module.exports = hashedPass;
