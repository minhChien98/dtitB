var express = require('express');
var router = express.Router();

var auth = require('../../middlewares/authenticate.js');


const config = require('../../config.js');
const Round = require('../../models/round.js');
const PlayGround = require('../../models/playground.js');
const Seq = require("seq");
const PLAYSTATE = require('../../CONST/PLAYSTATE.js');


router.post('/', auth, function (req, res) {

    if (req.decoded.role != 'admin') {
        res.status(403).json({
            code: config.CODE_ERR_WITH_MESS,
            message: 'access denied'
        });
        return;
    }

    if (Number(req.body.beginTime) >= Number(req.body.endTime)) {
        res.json({
            code: config.CODE_ERR_WITH_MESS,
            message: 'Begin time is greater or equal end time'
        });
        return;
    }
    console.log("time now");
    console.log(Date.now() / 1000);
    var round = new Round({
        name: req.body.name,
        time: Date.now() / 1000 | 0,
        questionsLists: JSON.parse(req.body.questionsLists),
        beginTime: Number(req.body.beginTime ? req.body.beginTime : 0),
        endTime: Number(req.body.endTime ? req.body.endTime : 9999999999),
        isAlwaysShow: req.body.isAlwaysShow,
        isAllowReplay: req.body.isAllowReplay,
        isAutoPlay: req.body.isAutoPlay,
        description: req.body.description,
        playTime: req.body.playTime
    });

    const save = round.save();
    save.then((rou) => {
        res.status(201).json({
            code: config.CODE_OK_WITH_MESS,
            id: rou._id
        });
    })
        .catch((err) => {
            res.json({
                code: config.CODE_ERR_WITH_MESS,
                message: 'Error: ' + err
            });
            return;
        });


});


router.get('/', auth, function (req, res) {
    if (req.decoded.role == 'admin') {
        const query = Round.find({});
        query.then((rounds) => {
            res.json({
                code: config.CODE_OK_WITH_MESS,
                rounds: rounds
            });
            return;
        })
            .catch((err) => {
                res.json({
                    code: config.CODE_ERR_WITH_MESS,
                    message: 'Error :' + err
                });
                return;
            });
    } else {
        res.status(403).json({
            code: config.CODE_ERR_WITH_MESS,
            message: 'Access denied'
        }).end();
    }
});

router.get('/available', auth, function (req, res) {

    var finalRet = [];
    var ret = [];
    var now = Date.now() / 1000 | 0;

    const query = Round.find({
        isAlwaysShow: true
    });
    query.then((rounds) => {
        ret = rounds;
        return Round.find({
            isAlwaysShow: false
        }).where('beginTime').lte(now).where('endTime').gte(now);
    })
        .then((rounds) => {
            ret = ret.concat(rounds);
            ret = ret.sort((a, b) => {
                return a.time - b.time;
            });

            Seq(ret).seqEach(function (x, i) {
                var queryp = PlayGround.findOne({ player: req.decoded._id, roundid: x._id, status: PLAYSTATE.FINISHED });
                queryp.then(((pr) => {
                    console.log(pr);
                    if (!pr) {
                        finalRet.push(x);
                        this();

                    }
                    else {
                        this();
                    }
                }).bind(this))
                    .catch(((err) => {
                        console.log(err);
                        this();
                    }).bind(this));


            })
                .seq(function () {
                    res.json({ code: config.CODE_OK_WITH_MESS, round: finalRet });
                    this();
                });


            // res.json({
            //     code: config.CODE_OK_WITH_MESS,
            //     round: ret
            // });
        })
        // .then((prounds)=>{
        //     console.log(prounds);
        // })
        .catch((err) => {
            res.json({
                code: config.CODE_ERR_WITH_MESS,
                message: 'Error :' + err
            });
            return;
        });
});

router.get('/:rid', auth, function (req, res) {

    const query = Round.findById(req.params.rid).populate('questionsLists.questlistId', 'name isRandom usingQuestion');
    query.then((round) => {
        res.json({
            code: config.CODE_OK_WITH_MESS,
            round: round
        });
        return;
    })
        .catch((err) => {
            res.json({
                code: config.CODE_ERR_WITH_MESS,
                message: 'Error :' + err
            });
            return;
        });
});


router.put('/:rid', auth, function (req, res) {
    if (req.decoded.role == 'admin') {
        const update = Round.findById(req.params.rid);
        update.then((round) => {
            if (!round) {
                res.json({
                    code: config.CODE_ERR_WITH_MESS,
                    message: 'round not found'
                });
                return;
            }

            // round.name = req.body.name;
            round.questionsLists = JSON.parse(req.body.questionsLists);
            // round.beginTime = Number(req.body.beginTime ? req.body.beginTime : 0);
            // round.endTime = Number(req.body.endTime ? req.body.endTime : 9999999999);
            // round.isAlwaysShow = req.body.isAlwaysShow;
            // round.isAllowReplay = req.body.isAllowReplay;
            // round.isAutoPlay = req.body.isAutoPlay;
            // round.description = req.body.description;
            // round.playTime = req.body.playTime;

            return round.save();
        })
            .then(() => {
                res.json({
                    code: config.CODE_OK
                });
            })
            .catch((err) => {
                res.json({
                    code: config.CODE_ERR_WITH_MESS,
                    message: 'Error :' + err
                });
                return;
            });
    } else {
        res.status(403).json({
            code: config.CODE_ERR_WITH_MESS,
            message: 'Access denied'
        }).end();
    }
});


router.put('/previous/:rid', auth, (req, res) => {
    if (req.decoded.role == 'admin') {
        const update = Round.findById(req.params.rid);
        var thisRound = undefined;
        update.then((round) => {
            if (!round) {
                res.json({
                    code: config.CODE_ERR_WITH_MESS,
                    message: 'round not found'
                });
                return;
            }
            if (!req.body.roundid) {
                res.json({
                    code: config.CODE_ERR_WITH_MESS,
                    message: 'round id input not correct'
                });
                return;
            }
            thisround = round;

            return Round.findById(req.body.roundid);
        })
            .then((round) => {

                if (round) {

                    thisround.previousRoute = round._id;
                } else {
                    return Promise.reject('cant find route input');
                }
                return thisround.save();
            })
            .then((round) => {
                if (round) {
                    res.json({
                        code: config.CODE_OK
                    });

                }
                else {
                    res.json({
                        code: config.CODE_ERR_WITH_MESS,
                        message: 'cant find route input'
                    });
                }
            })
            .catch((err) => {
                res.json({
                    code: config.CODE_ERR_WITH_MESS,
                    message: 'Error :' + err
                });
                return;
            });;
    } else {
        res.status(403).json({
            code: config.CODE_ERR_WITH_MESS,
            message: 'Access denied'
        }).end();
    }
});
router.put('/next/:rid', auth, (req, res) => {
    if (req.decoded.role == 'admin') {
        const update = Round.findById(req.params.rid);
        var thisRound = undefined;
        update.then((round) => {
            if (!round) {
                res.json({
                    code: config.CODE_ERR_WITH_MESS,
                    message: 'round not found'
                });
                return;
            }
            if (!req.body.roundid) {
                res.json({
                    code: config.CODE_ERR_WITH_MESS,
                    message: 'round id input not correct'
                });
                return;
            }
            thisround = round;

            return Round.findById(req.body.roundid);
        })
            .then((round) => {

                if (round) {

                    thisround.nextRoute = round._id;
                } else {
                    return Promise.reject('cant find route input');
                }
                return thisround.save();
            })
            .then((round) => {
                if (round) {
                    res.json({
                        code: config.CODE_OK
                    });

                } else {
                    res.json({
                        code: config.CODE_ERR_WITH_MESS,
                        message: 'cant find route input'
                    });
                }
            })
            .catch((err) => {
                res.json({
                    code: config.CODE_ERR_WITH_MESS,
                    message: 'Error :' + err
                });
                return;
            });
    } else {
        res.status(403).json({
            code: config.CODE_ERR_WITH_MESS,
            message: 'Access denied'
        }).end();
    }
});

module.exports = router;