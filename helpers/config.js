// configuration =========
// =======================
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

var config = require('../config.js'); // get our config file
const User = require('../models/user.js');
const PlayGround = require('../models/playground.js');
const PLAYSTATE = require('../CONST/PLAYSTATE.js');



module.exports.setup = function (app) {
	return new Promise((fulfill, reject) => {
		// mongoose.connect(config.database, config.dbAuth, function (error) {
		mongoose.connect(config.database, function (error) {
			if (error) {
				console.log(error);
			} else {
				console.log("connect db success");
				var refesh = User.update({}, {
					isOnline: false
				});
				refesh.then(() => {
					console.log('refesh data');

					return PlayGround.find({}).populate('history.question').sort({ time: -1 });

				})
					.then((playgrounds) => {

						playgrounds.forEach((pround) => {
							if (!global.userCurrentPlay.hasOwnProperty(pround.player)) {
								global.userCurrentPlay[pround.player] = { curPlay: pround._id, curstatus: pround.status, curquestIndex: pround.questIndex, history: pround.history, auto: pround.roundid.isAutoPlay ? pround.roundid.isAutoPlay : true, totalScore: pround.totalScore, totalTime: pround.totalTime };
							}
						});



						console.log('load playround data completed');


						//use cors to get restful data to angular
						app.use(cors());
						// use body parser so we can get info from POST and/or URL parameters
						app.use(bodyParser.urlencoded({
							extended: true
						}));
						app.use(bodyParser.json());
						// app.use(multer());

						// use morgan to log requests to the console
						app.use(morgan('dev'));

						console.log('Setup ok');
						fulfill();
					})
					.catch((err) => {
						console.log(err);
						reject(err);
					});
			}

		}); // connect to database


	});
};


// =======================