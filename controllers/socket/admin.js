const Question = require("../../models/question.js");
const Roles = require("../../models/role.js");
const User = require("../../models/user.js");
const Role = require("../../models/role.js");
let Answer1 = 0;
let Answer2 = 0;
let Answer3 = 0;
let Answer4 = 0;
let currentQues = 1;
module.exports = function(socket) {
  return function(data) {
    if (
      data.command === 1000 ||
      data.command === 1001 ||
      data.command === 1002
    ) {
      if (data.command === 1002) {
        Answer1 = 0;
        Answer2 = 0;
        Answer3 = 0;
        Answer4 = 0;
        currentQues = 1;
      }
      const question = Question.findById(data.message);
      question.then(quest => {
        if (!quest) {
          res.json({
            code: config.CODE_ERR_WITH_MESS,
            message: "question not found"
          });
          return;
        }
        socket.broadcast.emit("receiveQuestion", {
          message: quest,
          currentQues
        });
        currentQues++;
      });
    }
    if (data.command === 3001) {
      const question = Question.findById(data.message);
      question.then(quest => {
        if (!quest) {
          res.json({
            code: config.CODE_ERR_WITH_MESS,
            message: "question not found"
          });
          return;
        }
        socket.broadcast.emit("receiveQuestionView", { message: quest });
      });
    }
    if (data.command === 3000) {
      switch (data.message) {
        case "a": {
          Answer1++;
          break;
        }
        case "b": {
          Answer2++;
          break;
        }
        case "c": {
          Answer3++;
          break;
        }
        case "d": {
          Answer4++;
          break;
        }
      }
      // socket.broadcast.emit('viewerSubmit', { message: data.message });
    }
    if (data.command === 3002) {
      const sumAns = Answer1 + Answer2 + Answer3 + Answer4;
      const percentA = parseInt((Answer1 / sumAns) * 100, 10);
      const percentB = parseInt((Answer2 / sumAns) * 100, 10);
      const percentC = parseInt((Answer3 / sumAns) * 100, 10);
      const percentD = parseInt((Answer4 / sumAns) * 100, 10);
      socket.broadcast.emit("resultView", {
        message: { a: percentA, b: percentB, c: percentC, d: percentD }
      });
    }
    if (data.command === 4000) {
      var room = io.sockets.adapter.rooms["user room"];
      let socketIdArr = [];
      socketIdArr = room ? Object.keys(room.sockets) : [];
      socketIdArr.forEach(id => {
        const query = User.findById(global.hshSocketUser[id]).populate("role");
        query
          .then(user => {
            if (user) {
              socket.to(id).emit("receiveAnswer", {
                result: user.status,
                die: user.die
              });
            }
          })
          .catch(err => {
            console.log(err);
          });
      });
    }
    if (data.command === 4500) {
      let roleUserId = "";
      Role.find({})
        .then(role => {
          role.forEach(item => {
            if (item.name == "user") {
              roleUserId = item._id;
            }
          });
        })
        .catch(err => {
          console.log(err);
        });
      User.find({})
        .then(user => {
          user.map(item => {
            if (String(item.role) == String(roleUserId) && item.die < 2) {
              item.status = true;
              item.save(function(err) {
                if (err) {
                  console.log(err);
                  return;
                }
              });
            }
          });
        })
        .catch(err => {
          console.log(err);
        });
      socket.broadcast.emit("changeQuestionList");
    }
    if (data.command === 5000) {
      socket.broadcast.emit("stopTime");
    }
    if (data.command === 5001) {
      socket.broadcast.emit("continueTime");
    }
  };
};
