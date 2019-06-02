var express = require('express');
var router = express.Router();

var auth = require('../../middlewares/authenticate.js');


const config = require('../../config.js');
const QuestionList = require('../../models/questionlist.js');


router.post('/', auth, function(req, res) {

    if (req.decoded.role != 'admin') {
        res.status(403).json({ code: config.CODE_ERR_WITH_MESS, message: 'access denied' });
        return;
    }

    var questlst = new QuestionList({
        name: req.body.name,
        isRandom: req.body.isRandom,
        usingQuestion: req.body.usingQuestion,
        isShowMatrix: req.body.isShowMatrix,
        questions: JSON.parse(req.body.questions)
        });

    const save = questlst.save();
    save.then((question) => {
            res.status(201).json({ code: config.CODE_OK_WITH_MESS, id: questlst._id });
        })
        .catch((err) => {
            res.json({ code: config.CODE_ERR_WITH_MESS, message: 'Error: ' + err });
            return;
        });


});


router.get('/', auth, function(req, res) {
    if (req.decoded.role == 'admin') {
        const query = QuestionList.find({},'name isRandom usingQuestion');
        query.then((questionslists) => {
                res.json({ code: config.CODE_OK_WITH_MESS, questionslist: questionslists });
                return;
            })
            .catch((err) => {
                res.json({ code: config.CODE_ERR_WITH_MESS, message: 'Error :' + err });
                return;
            });
    } else {
        res.status(403).json({ code: config.CODE_ERR_WITH_MESS, message: 'Access denied' }).end();
    }
});

router.get('/:lid', auth, function(req, res) {
    if (req.decoded.role == 'admin') {
        const query = QuestionList.findById(req.params.lid,'name isRandom usingQuestion questions').populate('questions.questId', '-createdAt -updatedAt');
        query.then((questionslists) => {
                res.json({ code: config.CODE_OK_WITH_MESS, questionslist: questionslists });
                return;
            })
            .catch((err) => {
                res.json({ code: config.CODE_ERR_WITH_MESS, message: 'Error :' + err });
                return;
            });
    } else {
        res.status(403).json({ code: config.CODE_ERR_WITH_MESS, message: 'Access denied' }).end();
    }
});



router.put('/:lid', auth, function(req, res) {
    if (req.decoded.role == 'admin') {
        const update = QuestionList.findById(req.params.lid);
        update.then((questlist) => {
                if (!questlist) {
                    res.json({ code: config.CODE_ERR_WITH_MESS, message: 'question not found' });
                    return;
                }

                questlist.name = req.body.name;
                questlist.isRandom = req.body.isRandom;
                questlist.usingQuestion = req.body.usingQuestion;
                isShowMatrix = req.body.isShowMatrix;
                questlist.questions = JSON.parse(req.body.questions);

                return questlist.save();
            })
            .then(() => {
                res.json({ code: config.CODE_OK });
            });
    } else {
        res.status(403).json({ code: config.CODE_ERR_WITH_MESS, message: 'Access denied' }).end();
    }
});

module.exports = router;