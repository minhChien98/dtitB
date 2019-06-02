// =======================
// Session controller ================
// =======================

var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User = require('../../models/user'); // get our mongoose model
var passHelper = require('../../helpers/encrypt.js');
var config = require('../../config'); // get our config file

// TODO: route to authenticate a user (POST http://localhost:8080/api/authenticate)
router.post('/', function (req, res) {
  // find the user
  User.findOne({
    $or: [{
      phone: req.body.acc
    }, {
      studentId: req.body.acc
    }]
  }, function (err, user) {

    if (err) throw err;

    if (!user) {
      res.json({
        code: config.CODE_ERR_WITH_MESS,
        message: 'Authentication failed'
      });
    } else if (user) {

      // check if password matches
      if (!user.pass || user.pass != passHelper.hash(req.body.pass)) {
        res.json({
          code: config.CODE_ERR_WITH_MESS,
          message: 'Authentication failed'
        });
      } else {

        if (user.isLocked) {
          res.json({
            code: config.CODE_ERR_WITH_MESS,
            message: 'User locked.'
          }).end();
          return;
        }
        if (user.isOnline) {
          res.json({
            code: config.CODE_ERR_WITH_MESS,
            message: 'User is online already'
          });
          return;
        }
        var info = {
          _id: user._id,
          secret: user.timePassChange
        };

        var token = jwt.sign(info, config.secret, {
          expiresIn: "2d"
        });

        res.status(201).json({
          code: config.CODE_OK_WITH_MESS,
          token: token,
          user: {
            id: user._id,
            name: user.name,
            role: user.role.name,
            studentId: user.studentId
          }
        });
      }

    }

  }).populate('role');
});


module.exports = router;