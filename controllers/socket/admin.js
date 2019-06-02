const Question = require('../../models/question.js');
const Roles = require('../../models/role.js');
const User = require('../../models/user.js');
const Role = require('../../models/role.js');
let Answer1 = 0;
let Answer2 = 0;
let Answer3 = 0;
let Answer4 = 0;
let currentQues = 1;
module.exports = function (socket) {
  return function (data) {
    if (data.command === 1000 || data.command === 1001) {
      const question = Question.findById(data.message);
      question.then(quest => {
        if (!quest) {
          res.json({
            code: config.CODE_ERR_WITH_MESS,
            message: 'question not found'
          });
          return;
        }
        socket.broadcast.emit('receiveQuestion', { message: quest, currentQues });
        currentQues++;
      });
    }
    if (data.command === 3001) {
      const question = Question.findById(data.message);
      question.then(quest => {
        if (!quest) {
          res.json({
            code: config.CODE_ERR_WITH_MESS,
            message: 'question not found'
          });
          return;
        }
        socket.broadcast.emit('receiveQuestionView', { message: quest });
      });
    }
    if (data.command === 3000) {
      switch (data.message) {
        case 'a': {
          this.Answer1++;
          break;
        }
        case 'b': {
          this.Answer2++;
          break;
        }
        case 'c': {
          this.Answer3++;
          break;
        }
        case 'd': {
          this.Answer4++;
          break;
        }
      }
      // socket.broadcast.emit('viewerSubmit', { message: data.message });
    }
    if (data.command === 3002) {
      const sumAns = this.Answer1 + this.Answer2 + this.Answer3 + this.Answer4;
      const percentA = parseInt(this.Answer1 / sumAns, 10);
      const percentB = parseInt(this.Answer2 / sumAns, 10);
      const percentC = parseInt(this.Answer3 / sumAns, 10);
      const percentD = parseInt(this.Answer4 / sumAns, 10);
      socket.broadcast.emit('resultView', { message: { a: percentA, b: percentB, c: percentC, d: percentD} });
    }
    if (data.command === 4000) {
      var room = io.sockets.adapter.rooms['user room'];
      let socketIdArr = [];
      socketIdArr = room ? Object.keys(room.sockets) : [];
      socketIdArr.forEach(id => {
        const query = User.findById(global.hshSocketUser[id]).populate('role');
        query.then((user) => {
          if (user) {
            socket.to(id).emit('receiveAnswer', {
              result: user.status,
              die: user.die,
            });
          }
        })
          .catch((err) => {
            console.log(err);
          });
      });
    }
    if (data.command === 4500) {
      let roleUserId = '';
      Role.find({})
        .then(role => {
          role.forEach(item => {
            if (item.name == 'user') {
              roleUserId = item._id;
            }
          });
        })
        .catch((err) => {
          console.log(err);
        })
      User.find({})
        .then(user => {
          user.map(item => {
            if (item.role + '' == roleUserId + '' && item.die < 2) {
              item.status = true;
              item.save(function (err) {
                if (err) {
                  console.log(err);
                  return;
                }
              });
            }
          });
        })
        .catch((err) => {
          console.log(err);
        });
      socket.broadcast.emit('changeQuestionList');
    }
    if (data.command === 5000) {
      socket.broadcast.emit('stopTime');
    }
    if (data.command === 5001) {
      socket.broadcast.emit('continueTime');
    }
  };
};