// basic route
// =======================
// load all controller ================
// =======================

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

router.use('/setups', require('./setup.js'));
router.use('/users', require('./user.js'));
router.use('/auth', require('./session.js'));
router.use('/studentids', require('./studentid.js'));
router.use('/questions', require('./question.js'));
router.use('/questionlists', require('./questionlist.js'));
router.use('/rounds', require('./round.js'));
router.use('/currentrounds', require('./current_round.js'));
router.use('/playgrounds', require('./playground.js'));
router.use('/players', require('./players.js'));

module.exports = router;
