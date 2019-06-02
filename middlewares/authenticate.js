// =======================
// authenticate middleware ================
// =======================
var User = require('../models/user'); // get our mongoose model
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get our config file

module.exports = function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, config.secret, function (err, decoded) {
      if (err) {
        res.json({
          code: config.CODE_ERR_WITH_MESS,
          message: 'Failed to authenticate token.'
        });
        return;
      } else {
        // if everything is good, save to request for use in other routes
        User.findOne({
          _id: decoded._id,
          timePassChange: decoded.secret
        }, function (err, user) {
          if (err) throw err;

          if (!user) {
            res.json({
              code: config.CODE_ERR_WITH_MESS,
              message: 'Authentication failed.'
            });
            return;
          } else if (user.isLocked) {
            res.json({
              code: config.CODE_ERR_WITH_MESS,
              message: 'User is locked'
            });
            return;
          }
          else if (user) {
            req.decoded = {
              _id: user._id,
              name: user.name,
              phone: user.phone,
              studentId: user.studentId,
              role: user.role.name
            };
            next();
          }
        }).populate('role');

      }
    });
  } else {
    res.status(403).json({
      code: config.CODE_ERR_WITH_MESS,
      message: 'Access denied'
    }).end();
  }
};