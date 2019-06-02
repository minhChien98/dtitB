// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//setup a mongoose model and pass it using module.export
module.exports = mongoose.model('PlayGround', new Schema({

    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    roundid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Round'
    },
    questListId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuestionList'
    },
    history:[{
        question:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        start: Number,
        answer: String,
        answerScore: Number,
        score: Number,
        time: Number
        }],
    time: Number,
    status: Number, //0: init, 1: playing, 2: end
    questIndex: 0,
    totalScore: Number,
    totalTime: Number

}, { timestamps: true }));