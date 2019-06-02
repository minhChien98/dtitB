// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//setup a mongoose model and pass it using module.export
module.exports = mongoose.model('player', new Schema(
  {
    name: String,
    phone: String,
    studentId: String,
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    },
    status: Boolean,
    lastTime: Number
  },
  { timestamps: true }
)
);
