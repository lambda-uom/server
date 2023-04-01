const express = require("express");
const leaderBoard = express.Router();

const Users = require("../models/user.model");
const QuizSubmissions = require("../models/quizSubmission.model");

leaderBoard.get("/getLeaderboardData/:currentUser", async (req, res) => {
  const currentUser = req.params.currentUser;
  let quizSubmissions = await QuizSubmissions.find();
  let users = await Users.find();
  let leaderboardData = [];

  for (let user of users) {
    let totalScore = 0;
    let count = 0;
    for (let quizSub of quizSubmissions) {
      if (user._id.toString() === quizSub.userId.toString()) {
        totalScore += quizSub.score;
        count++;
      }
    }
    let averageScore = totalScore / count;
    let lbData = {
      empId: user.empId,
      firstName: user.firstName,
      lastName: user.lastName,
      totalScore,
      averageScore,
    };
    const userExist = await QuizSubmissions.find({ userId: user._id });
    if (userExist.length > 0) {
      leaderboardData.push(lbData);
    }
  }
  leaderboardData.sort((a, b) => b.averageScore - a.averageScore);

  let finalLeaderboardData = [];

  const userRole = await Users.findOne({
    empId: leaderboardData[0]?.empId,
  });

  let currentUserScore = 0;
  finalLeaderboardData = [];
  for (let lbdata of leaderboardData) {
    for (let user of users) {
      if (lbdata.empId === user.empId) {
        if (user.userRoleId.toString() === userRole?.userRoleId.toString()) {
          if (user._id.toString() === currentUser) {
            currentUserScore = lbdata?.averageScore;
            console.log();
          }
          finalLeaderboardData.push(lbdata);
        }
      }
    }
  }

  const rank = finalLeaderboardData.findIndex(
    (obj) => obj.averageScore === currentUserScore
  );

  const finalData = {
    lbData: finalLeaderboardData,
    currentUserScore,
    rank,
  };
  res.json(finalData);
});

leaderBoard.get("/getLeaderboardData", async (req, res) => {
  let quizSubmissions = await QuizSubmissions.find();
  let users = await Users.find();
  let leaderboardData = [];

  for (let user of users) {
    let totalScore = 0;
    let count = 0;
    for (let quizSub of quizSubmissions) {
      if (user._id.toString() === quizSub.userId.toString()) {
        totalScore += quizSub.score;
        count++;
      }
    }
    let averageScore = totalScore / count;
    let lbData = {
      empId: user.empId,
      firstName: user.firstName,
      lastName: user.lastName,
      totalScore,
      averageScore,
    };
    const userExist = await QuizSubmissions.find({ userId: user?._id });
    if (userExist?.length > 0) {
      leaderboardData.push(lbData);
    }
  }
  leaderboardData.sort((a, b) => b.averageScore - a.averageScore);

  let finalLeaderboardData = [];

  if (leaderboardData?.[0]?.totalScore > 0) {
    let hiredEmployee = leaderboardData[0].empId;

    for (let user of users) {
      if (user.empId === hiredEmployee) {
        hiredEmployee = user.userRoleId;
      }
    }
    finalLeaderboardData = [];
    for (let lbdata of leaderboardData) {
      for (let user of users) {
        if (lbdata.empId === user.empId) {
          if (user.userRoleId.toString() === hiredEmployee.toString()) {
            finalLeaderboardData.push(lbdata);
          }
        }
      }
    }
  }

  res.json(finalLeaderboardData);
});

module.exports = leaderBoard;
