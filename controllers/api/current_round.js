var express = require('express');
var router = express.Router();

var auth = require('../../middlewares/authenticate.js');


const config = require('../../config.js');
const CurrentRound = require('../../models/current_round.js');


router.post('/', auth, function(req, res) {

    if (req.decoded.role != 'admin') {
        res.status(403).json({ code: config.CODE_ERR_WITH_MESS, message: 'access denied' });
        return;
    }
    var query = CurrentRound.findOne({});
    query.then((currentround) => {
            if(!currentround || currentround.length == 0)
            {
                var cround = new CurrentRound({
                    round: req.body.round,
                    beginTime: req.body.beginTime,
                    endTime: req.body.endTime
                });

                return cround.save();
            }
            else
            {
                return;

            }
        })
        .then((curround) => {
            if(!curround)
            {
                res.json({code:config.CODE_ERR_WITH_MESS, message: 'current round created'});
                return;
            }
            else
            {

            res.json({code: config.CODE_OK_WITH_MESS, id: curround._id});
            }
        })
        .catch((err) => {
            res.json({ code: config.CODE_ERR_WITH_MESS, message: 'Error:' + err });
            return;
        });
});


router.get('/', auth, function(req, res) {
    
        const query = CurrentRound.findOne({});
        query.then((questions) => {
                res.json({ code: config.CODE_OK_WITH_MESS, questions: questions });
                return;
            })
            .catch((err) => {
                res.json({ code: config.CODE_ERR_WITH_MESS, message: 'Error :' + err });
                return;
            });
});


router.put('/:qid', auth, function(req, res) {
    if (req.decoded.role == 'admin') {
        const update = Question.findById(req.params.qid);
        update.then((quest) => {
                if (!quest) {
                    res.json({ code: config.CODE_ERR_WITH_MESS, message: 'question not found' });
                    return;
                }

                quest.content = req.body.content;
                quest.image = req.body.image;
                quest.video = req.body.video;
                quest.isHaveOption = req.body.isHaveOption;
                quest.isHtml = req.body.isHtml;
                quest.options = JSON.parse(req.body.options);
                quest.correctAnswer = req.body.correctAnswer;

                return quest.save();
            })
            .then(() => {
                res.json({ code: config.CODE_OK });
            });
    } else {
        res.status(403).json({ code: config.CODE_ERR_WITH_MESS, message: 'Access denied' }).end();
    }
});

module.exports = router;