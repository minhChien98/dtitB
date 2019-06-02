var express = require('express');
var router = express.Router();

var auth = require('../../middlewares/authenticate.js');


const config = require('../../config.js');
const PlayGround = require('../../models/playground.js');
const Round = require('../../models/round.js');
const Random = require('../../helpers/random.js');
const QuestionHelper = require('../../helpers/question.js');
const PLAYSTATE = require('../../CONST/PLAYSTATE.js');


router.post('/', auth, function (req, res) {
    const query = PlayGround.findOne({
        player: req.decoded._id,
        roundid: req.body.roundid
    });

    var thisRound = undefined;
    var thisPRound = undefined;

    query.then((pround) => {
        thisPRound = pround;
        return Round.findById(req.body.roundid).populate('questionsLists.questlistId');
    })
        .then((round) => {
            thisRound = round;
            if (!round) {
                return Promise.reject({ code: config.CODE_ERR_WITH_MESS, message: 'Dont find round' });
            }

            if (!round.questionsLists || round.questionsLists.length == 0) {
                return Promise.reject({ code: config.CODE_ERR_WITH_MESS, message: 'dont have question list' });
            }

            const now = Date.now() / 1000 | 0;
            if (now < round.beginTime) {
                return Promise.reject({ code: config.CODE_ERR_WITH_MESS, message: 'round hasnot begun' });
            }

            if (now > round.endTime) {
                return Promise.reject({ code: config.CODE_ERR_WITH_MESS, message: 'round playing time expire' });
            }

            if (thisPRound && !thisRound.isAllowReplay) {
                if (PLAYSTATE.PLAYING == thisPRound.status || PLAYSTATE.BEGIN == thisPRound.status) {
                    return Promise.reject({
                        code: config.CODE_OK_WITH_MESS,
                        id: thisPRound._id
                    });
                }
                else {
                    return Promise.reject({ code: config.CODE_ERR_WITH_MESS, message: 'you have played this round' });
                }
            }

            if (thisRound.previousRoute) {
                return PlayGround.findOne({
                    player: req.decoded._id,
                    roundid: thisRound.previousRoute
                });
            }

            return new PlayGround();
        })
        .then((preplay) => {

            if (!preplay) {
                return Promise.reject({ code: config.CODE_ERR_WITH_MESS, message: 'You must play previous route' });
            }

            // const questList = thisRound.questionsLists[Random.generate(0, thisRound.questionsLists.length - 1)].questlistId;
            const questList = thisRound.questionsLists[0].questlistId;

            //pick question from list
            var histories = [];

            QuestionHelper.choose(questList.questions, histories, questList.usingQuestion, questList.isRandom, thisRound.playTime ? thisRound.playTime : 30);

            var playground = new PlayGround({
                player: req.decoded._id,
                roundid: thisRound._id,
                questListId: questList,
                time: Date.now() / 1000 | 0,
                status: PLAYSTATE.BEGIN,
                history: histories,
                questIndex: 0,
                totalScore: 0,
                totalTime: 0
            });

            return playground.save();
        })
        .then((playground) => {
            if (playground) {
                res.status(201).json({
                    code: config.CODE_OK_WITH_MESS,
                    id: playground._id
                });
                return;
            }
        })
        .catch((err) => {
            res.json(err);
            return;
        });
});

router.get('/played', auth, (req, res) => {
    const query = PlayGround.find({
        player: req.decoded._id
    }, '-history').populate('roundid');
    query.then((prounds) => {
        res.json({
            code: config.CODE_OK_WITH_MESS,
            playedrounds: prounds
        });
    })
        .catch((err) => {
            res.json({
                code: config.CODE_ERR_WITH_MESS,
                message: 'Error: ' + err
            });
            return;
        })
});
router.get('/played/:rid', auth, (req, res) => {
    const query = PlayGround.find({
        player: req.decoded._id,
        roundid: req.params.rid
    }, '-history').populate('roundid');
    query.then((prounds) => {
        res.json({
            code: config.CODE_OK_WITH_MESS,
            playedrounds: prounds
        });
    })
        .catch((err) => {
            res.json({
                code: config.CODE_ERR_WITH_MESS,
                message: 'Error: ' + err
            });
            return;
        })
});
router.get('/played/ground/:pid', auth, (req, res) => {
    const query = PlayGround.findById(req.params.pid, '-history').populate('roundid');
    query.then((prounds) => {
        res.json({
            code: config.CODE_OK_WITH_MESS,
            playedrounds: prounds
        });
    })
        .catch((err) => {
            res.json({
                code: config.CODE_ERR_WITH_MESS,
                message: 'Error: ' + err
            });
            return;
        })
});


router.post('/play', auth, (req, res) => {
    const query = PlayGround.findById(req.body.pid).populate('history.question roundid');
    query.then((pround) => {
        if (!pround) {
            return Promise.reject({
                code: config.CODE_ERR_WITH_MESS,
                message: 'dont find playround'
            });
        }

        if (global.userCurrentPlay.hasOwnProperty(req.decoded._id)) {
            // return Promise.reject({
            //     code: config.CODE_ERR_WITH_MESS,
            //     status: PLAYSTATE.PLAYING,
            //     message: 'you need finish previous playground'
            // });


            if (PLAYSTATE.PLAYING == global.userCurrentPlay[req.decoded._id].curstatus && !global.userCurrentPlay[req.decoded._id].curPlay.equals(pround._id)) {
                if (global.hshUserTimeout.hasOwnProperty(req.decoded._id)) {
                    clearTimeout(global.hshUserTimeout[playerid]);
                    delete global.hshUserTimeout[playerid];
                }
            }



        }

        //start play groundf
        if (PLAYSTATE.BEGIN == pround.status) {
            //begin play
            pround.questIndex = 0;
            pround.status = PLAYSTATE.PLAYING;


            global.userCurrentPlay[req.decoded._id] = {
                curPlay: pround._id,
                curstatus: pround.status,
                curquestIndex: pround.questIndex,
                history: pround.history,
                auto: pround.roundid.isAutoPlay ? pround.roundid.isAutoPlay : true,
                totalScore: 0,
                totalTime: 0
            };

            // const now = Date.now()/1000 | 0;
            // global.userCurrentPlay[req.decoded._id].history[pround.questIndex].start  = now;
            // pround.history[pround.questIndex].start = now;


            return pround.save();
        } else if (pround.status >= PLAYSTATE.FINISHED) {
            return Promise.reject({
                code: config.CODE_ERR_WITH_MESS,
                status: pround.status,
                message: 'play finished'
            });
        } else {
            // if(!global.userCurrentPlay.hasOwnProperty(req.decoded._id) || global.userCurrentPlay[req.decoded._id].curPlay != pround._id)
            // {
            //     global.userCurrentPlay[req.decoded._id] = {curPlay: pround._id,curquestIndex: pround.questIndex, history: pround.history};
            // }
            try {
                if (!global.userCurrentPlay.hasOwnProperty(req.decoded._id) || !global.userCurrentPlay[req.decoded._id].curPlay.equals(pround._id)) {

                    global.userCurrentPlay[pround.player] = {
                        curPlay: pround._id,
                        curstatus: pround.status,
                        curquestIndex: pround.questIndex,
                        history: pround.history,
                        auto: pround.roundid.isAutoPlay ? pround.roundid.isAutoPlay : true,
                        totalScore: pround.totalScore,
                        totalTime: pround.totalTime
                    };
                }
                QuestionHelper.startQuestion(req.decoded._id);

            } catch (err) {
                console.log(err);
            }
            // const curPlayTemp = global.userCurrentPlay[req.decoded._id];
            // var questionTemp = curPlayTemp.history[curPlayTemp.curquestIndex].question;
            // questionTemp.correctAnswer = undefined;

            return Promise.reject({
                code: config.CODE_OK_WITH_MESS,
                status: pround.status,
                message: 'playing'
            });
        }
    })
        .then((pround) => {
            res.json({
                code: config.CODE_OK_WITH_MESS,
                status: pround.status,
                message: 'begin play'
            });
            QuestionHelper.startQuestion(req.decoded._id);
            //setup cache parametter
        })
        .catch((reson) => {
            res.json(reson);
            return;
        })
});


router.get('/play', auth, (req, res) => {

    var now = Date.now() / 1000 | 0;
    if (!global.userCurrentPlay.hasOwnProperty(req.decoded._id)) {
        res.json({
            code: config.CODE_ERR_WITH_MESS,
            message: 'It is not in playing state'
        });
        return;
    }

    const curPlayTemp = global.userCurrentPlay[req.decoded._id];
    if (PLAYSTATE.PLAYING != curPlayTemp.curstatus) {
        res.json({
            code: config.CODE_ERR_WITH_MESS,
            message: 'It is not in playing state'
        });
        return;
    }

    var history = curPlayTemp.history[curPlayTemp.curquestIndex];
    var questionTemp = history.question;


    res.json({
        code: config.CODE_OK_WITH_MESS,
        status: curPlayTemp.curstatus,
        question: {
            start: history.start,
            now: now,
            duration: history.time,
            content: questionTemp.content,
            image: questionTemp.image,
            video: questionTemp.video,
            isRandomOption: questionTemp.isRandomOption,
            isHaveOption: questionTemp.isHaveOption,
            isHtml: questionTemp.isHaveOption,
            options: questionTemp.options
        }
    });
});

router.post('/answer', auth, (req, res) => {

    if (!global.userCurrentPlay.hasOwnProperty(req.decoded._id)) {
        res.json({
            code: config.CODE_ERR_WITH_MESS,
            message: 'It is not in playing state'
        });
        return;
    }

    const curPlayTemp = global.userCurrentPlay[req.decoded._id];


    if (PLAYSTATE.PLAYING != curPlayTemp.curstatus) {
        res.json({
            code: config.CODE_ERR_WITH_MESS,
            message: 'It is not in playing state'
        });
        return;
    }

    var history = curPlayTemp.history[curPlayTemp.curquestIndex];
    var questionTemp = history.question;
    var now = Date.now() / 1000 | 0;

    if (now - history.start > history.time) {
        res.json({
            code: config.CODE_ERR_WITH_MESS,
            message: 'Too late to answer'
        });
        return;
    }

    if (global.hshUserTimeout.hasOwnProperty(req.decoded._id)) {
        clearTimeout(global.hshUserTimeout[req.decoded._id]);
    }

    history.answer = req.body.answer;

    const querry = PlayGround.findById(curPlayTemp.curPlay);
    querry.then((pround) => {
        if (!pround) {
            return Promise.reject({
                code: config.CODE_ERR_WITH_MESS,
                message: 'dont find player playround'
            });
        }
        pround.history[curPlayTemp.curquestIndex].answer = history.answer;
        return pround.save();
    })
        .then((pround) => {
            res.json({
                code: config.CODE_OK
            });
            QuestionHelper.nextQuestion(req.decoded._id);
        })
        .catch((err) => {
            res.json(err);
            return;
        });
});
router.get('/scoreboard', (req, res) => {
    const query = PlayGround.find({}, 'roundid questListId status totalScore  totalTime questIndex player').populate('player', 'name studentId isOnline');
    query.then((playgrounds) => {
        var group = {};
        var ret = [];
        playgrounds.forEach(function (p) {
            if (!group.hasOwnProperty(p.player._id)) {
                group[p.player._id] = p;
            }
            else {
                group[p.player._id].totalScore += p.totalScore;
                group[p.player._id].totalTime += p.totalTime;

            }
        });

        Object.keys(group).map(function (key) {
            ret.push(group[key]);
        });

        ret = ret.sort((a, b) => {
            var s = b.totalScore - a.totalScore;
            if (0 == s) {
                s = a.totalTime - b.totalTime;
            }
            return s;
        });
        res.json({
            code: config.CODE_OK_WITH_MESS,
            score: ret
        });
    })
        .catch((err) => {
            res.json(err);
        });
});

module.exports = router;