// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//setup a mongoose model and pass it using module.export
module.exports = mongoose.model('Round', new Schema({
    name: String,
    questionsLists: [{
        questlistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'QuestionList'
        }
    }],
    time: Number,
    beginTime: Number, //if 0
    endTime: Number, // if 0 
    isAlwaysShow: Boolean,
    isAllowReplay: Boolean,
    isAutoPlay: Boolean,
    description: String,
    playTime: Number,//second
    previousRoute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Round'
    },
    nextRoute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Round'
    }


}, { timestamps: true }));