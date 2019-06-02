// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//setup a mongoose model and pass it using module.export
module.exports = mongoose.model('Question', new Schema({

    content: String,
    image: String,
    video: String,
    isHaveOption: Boolean, //if true, show options, false: ask for entry answer
    isHtml: Boolean, //if is Html, show content in html without image and video
    isRandomOption: Boolean,
    options: [{
        numbering: String,
        answer: String
    }],
    correctAnswer: String

}, { timestamps: true }));