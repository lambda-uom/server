const express = require("express");
const badges = express.Router();

const Users = require("../models/user.model");
const QuizSubmissions = require("../models/quizSubmission.model");

badges.get("/storeBadge/:currentUser", async (req, res) => {
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
    const averageScore = totalScore / count;
    let lbData = {
      empId: user.empId,
      averageScore,
    };
    const userExist = await QuizSubmissions.find({ userId: user?._id });
    if (userExist?.length > 0) {
      leaderboardData.push(lbData);
    }
  }
  leaderboardData.sort((a, b) => b?.averageScore - a?.averageScore);

  let finalLeaderboardData = [];

  const { userRoleId } = await Users.findOne({
    empId: leaderboardData?.[0]?.empId,
  });

  finalLeaderboardData = [];
  for (let lbdata of leaderboardData) {
    for (let user of users) {
      if (lbdata.empId === user.empId) {
        if (user.userRoleId.toString() === userRoleId.toString()) {
          finalLeaderboardData.push(lbdata);
        }
      }
    }
  }

  //badge giving
  const currentUser = req.params.currentUser;
  const userEmpId = await Users.findOne({ _id: currentUser });
  let rank = finalLeaderboardData.findIndex(
    (data) => data?.empId === userEmpId?.empId
  );

  switch (rank) {
    case 0:
      userEmpId?.badges?.push({
        badgeValue: "Gold",
        earnedOn: Date.now(),
      });
      userEmpId?.save((err) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send("Gold badge added successfully");
        }
      });
      break;
    case 1:
      userEmpId?.badges.push({
        badgeValue: "Silver",
        earnedOn: Date.now(),
      });
      userEmpId?.save((err) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send("Silver badge added successfully");
        }
      });
      break;
    case 2:
      userEmpId?.badges?.push({
        badgeValue: "Bronze",
        earnedOn: Date.now(),
      });
      userEmpId?.save((err) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send("Bronze badge added successfully");
        }
      });
      break;
    default:
      res.json("Badge is not applicable for this user");
  }
});

badges.get("/showbadge/:currentUser", async (req, res) => {
  const currentuser = req.params.currentUser;
  const user = await Users.findOne({ _id: currentuser });
  console.log(user.hasOwnProperty(badges));

  if (!user) {
    res.status(404).send("User field not found");
    return;
  }
  let badgeArr = [];
  user?.badges.forEach((badge, index) => {
    switch (badge.badgeValue) {
      case "Gold":
        badgeArr.push(0);
        break;
      case "Silver":
        badgeArr.push(1);
        break;
      case "Bronze":
        badgeArr.push(2);
        break;
    }
  });
  res.json(badgeArr);
});

module.exports = badges;
