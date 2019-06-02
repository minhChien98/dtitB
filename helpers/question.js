// =======================
// Question choose helper =========
// =======================

const CONSTS = require('../CONST/SOCKET_CONST.js');
const PlayGround = require('../models/playground.js');
const config = require('../config.js');
const PLAYSTATE = require('../CONST/PLAYSTATE.js');

var choose = function (source, target, size, isRandom, questionTime) {

    //check target
    if (target && target.length > 0) {
        target.length = 0;
    } else if (!target) {
        return;
    }
    var temp = JSON.parse(JSON.stringify(source));
    if (isRandom) {
        shuffle(temp);
    }
    if (source.length > size) {
        temp = temp.slice(0, size);
    }
    temp.forEach(function (question) {
        const obj = {
            question: question.questId,
            answerScore: question.point,
            answer: null,
            score: 0,
            time: questionTime
        };
        target.push(obj);
    }, this);
    return target;
}

var shuffle = function(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
    return a;
}

var startQuestion = function (playerid) {

    const curPlayTemp = global.userCurrentPlay[playerid];


    if(curPlayTemp.curquestIndex >= curPlayTemp.history.length)
    {
        throw new Error('quest index greater than number of quest');
    }

    var history = curPlayTemp.history[curPlayTemp.curquestIndex];
    var questionTemp = history.question;


    if (!history.start || 0 == history.start) {
        history.start = Date.now() / 1000 | 0;
    }


    if (global.hshUserSocket.hasOwnProperty(playerid)) {
        // var querry = PlayGround.findById(curPlayTemp.curPlay)

        // querry.then((pround)=>{
        //     console.log(pround);
        // })
        // // .then()
        // .catch((err)=>{});

        const socketid = global.hshUserSocket[playerid];
        const now = Date.now() / 1000 | 0;
        
        var options = shuffle(questionTemp.options);

        global.hshIdSocket[socketid].emit(CONSTS.NAMESPACE.QUESTION, {
            command: CONSTS.RETURN.QUEST.RAISE,
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
                options: options
            }
        });


        // if (!global.hshUserTimeout.hasOwnProperty(playerid)) {
        //     global.hshUserTimeout[playerid] = setTimeout(() => {
        //         console.log('test');
        //     }, 10000);
        // }


        // if (global.hshUserTimeout.hasOwnProperty(playerid)) {
        //     console.log('here2');
        //     clearTimeout(global.hshUserTimeout[playerid]);
        //     clearTimeout(global.hshUserTimeout[playerid]);
        // }

        if (now - history.start < history.time) {
            if (global.hshUserTimeout.hasOwnProperty(playerid)) {
                clearTimeout(global.hshUserTimeout[playerid]);
                delete global.hshUserTimeout[playerid];
            }
            global.hshUserTimeout[playerid] = setTimeout(() => {
                nextQuestion(playerid);
            }, (history.time - (now - history.start))*1000);
        } else {
            // console.log(now - history.start, history.time);
            nextQuestion(playerid);

        }

    } else {
        console.log('Error, check user: ' + playerid);
    }
}

//caculate score, time
var nextQuestion = function(playerid) {

    const curPlayTemp = global.userCurrentPlay[playerid];
    var history = curPlayTemp.history[curPlayTemp.curquestIndex];
    var questionTemp = history.question;
    const now = Date.now()/1000 | 0;

    const chooseAnswer = history.answer;
    const correctAnswer = questionTemp.correctAnswer;

    const querry = PlayGround.findById(curPlayTemp.curPlay);
    querry.then((pround)=>{
        if(!pround)
        {
            return Promise.reject({code:config.CODE_ERR_WITH_MESS,message:'dont find player playround'});
        }
        //correct answer
        if(null != chooseAnswer && chooseAnswer == correctAnswer)
        {
            // console.log(history);
            // pround.history[curPlayTemp.curquestIndex]
            //update memory
            history.score = history.answerScore;
            curPlayTemp.totalScore += history.score;

        }
            history.time = now - history.start <=  history.time? now - history.start: history.time;
            curPlayTemp.totalTime += history.time;

            pround.history[curPlayTemp.curquestIndex].score = history.score;
            pround.history[curPlayTemp.curquestIndex].time = history.time;

            pround.totalScore = curPlayTemp.totalScore;
            pround.totalTime = curPlayTemp.totalTime;

            if(curPlayTemp.auto)
            {
                curPlayTemp.curquestIndex ++;
                pround.questIndex = curPlayTemp.curquestIndex;
                if(curPlayTemp.curquestIndex >= curPlayTemp.history.length)
                {
                    curPlayTemp.curstatus = PLAYSTATE.FINISHED;
                    pround.status = PLAYSTATE.FINISHED;
                }

            }
            return pround.save();
    })
    .then((pround)=>{
        
        const socketid = global.hshUserSocket[playerid];
        // global.hshIdSocket[socketid].emit(CONSTS.NAMESPACE.QUESTION,{command:CONSTS.RETURN.QUEST.CHOOSE_ANSWER,question:history});
        global.io.to(CONSTS.ROOMS.ADMIN).emit(CONSTS.NAMESPACE.QUESTION,{command:CONSTS.RETURN.QUEST.CHOOSE_ANSWER,question:history,player:playerid, totalScore:curPlayTemp.totalScore,totalTime:curPlayTemp.totalTime});
        global.io.to(CONSTS.ROOMS.VIEWER).emit(CONSTS.NAMESPACE.QUESTION,{command:CONSTS.RETURN.QUEST.CHOOSE_ANSWER,question:history,player:playerid, totalScore:curPlayTemp.totalScore,totalTime:curPlayTemp.totalTime});
        if(curPlayTemp.auto && PLAYSTATE.PLAYING == curPlayTemp.curstatus)
        {
            startQuestion(playerid);
        }
        else if(PLAYSTATE.FINISHED == curPlayTemp.curstatus)
        {
                global.hshIdSocket[socketid].emit(CONSTS.NAMESPACE.QUESTION,{command:CONSTS.RETURN.QUEST.FINISHED_ROUTE,totalScore:curPlayTemp.totalScore,totalTime:curPlayTemp.totalTime});
        }
    })
    .catch((err)=>{
        console.log({code:config.CODE_ERR_WITH_MESS,message:err});
    });

}

module.exports = {
  choose: choose,
  startQuestion: startQuestion,
  nextQuestion: nextQuestion,
  shuffle: shuffle
}