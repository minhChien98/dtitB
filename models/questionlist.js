// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//setup a mongoose model and pass it using module.export
module.exports = mongoose.model('QuestionList', new Schema({
    name: String,
    isRandom: Boolean,
    isShowMatrix: Boolean,
    usingQuestion: Number,
    questions: [{
        questId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        point: Number
    }]

}, { timestamps: true }));