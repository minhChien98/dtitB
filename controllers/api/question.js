var express = require('express');
var router = express.Router();

var auth = require('../../middlewares/authenticate.js');


const config = require('../../config.js');
const Question = require('../../models/question.js');


router.post('/', auth, function(req, res) {

    if (req.decoded.role != 'admin') {
        res.status(403).json({ code: config.CODE_ERR_WITH_MESS, message: 'access denied' });
        return;
    }

    var quest = new Question({
        content: req.body.content,
        image: req.body.image,
        video: req.body.video,
        isHaveOption: req.body.isHaveOption,
        isRandomOption: req.body.isRandomOption,
        isHtml: req.body.isHtml,
        options: JSON.parse(req.body.options),
        correctAnswer: req.body.correctAnswer
    });

    const save = quest.save();
    save.then((question) => {
            res.status(201).json({ code: config.CODE_OK_WITH_MESS, id: question._id });
        })
        .catch((err) => {
            res.json({ code: config.CODE_ERR_WITH_MESS, message: 'Error: ' + err });
            return;
        });


});


router.get('/', auth, function(req, res) {
    if (req.decoded.role == 'admin') {
        const query = Question.find({});
        query.then((questions) => {
                res.json({ code: config.CODE_OK_WITH_MESS, questions: questions });
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
                quest.isRandomOption = req.body.isRandomOption;
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