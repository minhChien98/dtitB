// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//setup a mongoose model and pass it using module.export
module.exports = mongoose.model('Role', new Schema({
    name: String
}, {timestamps: true} ));