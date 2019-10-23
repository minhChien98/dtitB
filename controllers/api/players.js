var express = require("express");
var router = express.Router();
var auth = require("../../middlewares/authenticate.js");
const config = require("../../config.js");
const Players = require("../../models/players.js");
const Users = require("../../models/user");
const Question = require("../../models/question");

router.post("/answer", auth, (req, res) => {
  const user = Users.findById(req.decoded._id);
  if (user) {
    user.then(user => {
      if (user.status == false) {
        res.json({
          message: "The player has been disqualified"
        });
      } else {
        var question = Question.findById(req.body.questionId);
        if (question) {
          question.then(quest => {
            if (quest.correctAnswer != req.body.answer) {
              user.set({
                status: false
              });
              const result = user.save();
              if (result) {
                result.then(result => {
                  res.json({
                    status: false,
                    message: "don't correct"
                  });
                });
              }
            } else {
              user.set({
                lastTime: req.body.time
              });
              var result = user.save();
              if (result) {
                result.then(result => {
                  res.json({
                    status: true,
                    message: "correct anwser"
                  });
                });
              }
            }
          });
        } else {
          res.json({
            message: "can not find question"
          });
        }
      }
    });
  } else {
    res.json({
      code: false,
      message: "can not find user"
    });
  }
  console.log(req.body);
});

router.post("/check", auth, (req, res) => {
  var player = Users.findById(req.decoded._id);
  player.then(player => {
    if (
      (player.status == false || player.status == undefined) &&
      Number(player.die) == 2
    ) {
      res.json({
        code: 0,
        message: "Da bi loai"
      });
      return;
    } else if (
      (player.status == false || player.status == undefined) &&
      Number(player.die) == 1
    ) {
      res.json({
        code: 2,
        message: "Bị loại vòng 1"
      });
      return;
    } else if (
      (player.status == true || player.status == undefined) &&
      Number(player.die) == 1
    ) {
      res.json({
        code: 2,
        message: "Bị loại vòng 1"
      });
      return;
    } else {
      res.json({
        code: 1,
        message: "Khong bi loai"
      });
      return;
    }
  });

  // console.log(req.decoded._id);
});
router.post("/checkSAT", auth, (req, res) => {
  var player = Players.findOne({
    studentId: req.body.studentId
  });

  player.then(player => {
    if (player.status == false || player.lastTime == -10) {
      res.json({
        code: 0,
        message: "Da bi loai"
      });
      return;
    } else {
      Players.findById(player[0]._id, function(err, player) {
        player.set({
          lastTime: -10
        });
        player.save();
      });
      res.json({
        code: 1,
        message: "Khong bi loai"
      });
      return;
    }
  });

  console.log(req.body);
});
module.exports = router;
