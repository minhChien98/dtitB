// =======================
// Setups controller ================
// =======================

var express = require('express');
var router = express.Router();

var Role = require('../../models/role'); // get our mongoose model
var User = require('../../models/user');
const passHelper = require('../../helpers/encrypt.js');

const config = require('../../config.js');


router.post('/', function (req, res) {
	if(req.body.pass == '1234abcd')
	{
	    Role.find({}, function (err, roles) {
	        if (err) throw err;

	        if (roles.length == 0) {
	            var role = new Role({
	                name: config.ROLE_ADMIN
	            });
	            role.save(function (err) { if (err) throw err; });
				var admin = new User({ phone: config.ROLE_ADMIN, name:config.ROLE_ADMIN, studentId:config.ROLE_ADMIN, pass: passHelper.hash(config.ROLE_ADMIN), role: role._id,isLocked:false, isOnline:false, timePassChange: Date.now()/1000 | 0 });
	            admin.save(function (err) { if (err) throw err; });


	            var role = new Role({
	                name: config.ROLE_VIEWER
	            });

	            role.save(function (err) { if (err) throw err; });
				var viewer = new User({ phone: config.ROLE_VIEWER, name:config.ROLE_VIEWER,studentId:config.ROLE_VIEWER, pass: passHelper.hash(config.ROLE_VIEWER), role: role._id,isLocked:false, isOnline:false, timePassChange: Date.now()/1000 | 0 });
	            viewer.save(function (err) { if (err) throw err; });


				var role = new Role({
	                name: config.ROLE_USER
	            });

	            role.save(function (err) { if (err) throw err; });

	            res.status(201).json({ code: config.CODE_OK_WITH_MESS, message: 'Setup completed' });
	        }
	        else {
	            Role.find({}, function (err, roles) {
	                if (err) throw err;
	                res.status(200).json({ code: config.CODE_OK_WITH_MESS , message: 'Already setup', number: roles.length, roles: roles })
	            });
	        }
	    });
	}
	else
	{
		res.status(403).end();
	}
});  

module.exports = router;