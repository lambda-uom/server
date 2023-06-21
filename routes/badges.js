const express = require("express");
const badges = express.Router();

const Users = require("../models/user.model");
const QuizSubmissions = require("../models/quizSubmission.model");
const Departments = require("../models/department.model");
const Chapters = require("../models/chapter.model");

badges.post("/storeBadge", async (req, res) => {
  try {
    // Get the current user ID from the request parameters
    const currentUserDep = req.body?.department;

    // // Retrieve all quiz submissions and users from the database
    let leaderboard = [];
    // get users from specific department
    const usersData = await Users.find({ department: currentUserDep });
    for (const user of usersData) {
      let totalScore = 0;
      let count = 0;
      // get chapters from specific department
      const chaptersData = await Chapters.find({ depID: currentUserDep });
      for (const chapters of chaptersData) {
        for (const units of chapters?.unitsOffer) {
          // get submissions from specific unit and user
          const quizSubmissionsData = await QuizSubmissions.find({
            unitId: units,
            userId: user?._id,
          });
          for (const quizSubmissions of quizSubmissionsData) {
            totalScore += quizSubmissions?.score;
            count++;
          }
        }
      }

      let averageScore = totalScore / count;
      if (!isNaN(averageScore)) {
        let lbData = {
          empId: user?.empId,
          averageScore,
          rank: 0,
        };
        leaderboard.push(lbData);
        leaderboard.sort((a, b) => b.averageScore - a.averageScore);
      }
    }
    let rank = 1;
    for (let i = 0; i < leaderboard.length; i++) {
      if (
        i > 0 && //always first index of leaderboard person should be rank 1
        leaderboard[i].averageScore !== leaderboard[i - 1].averageScore
      ) {
        rank = i + 1;
      }
      leaderboard[i].rank = rank;
    }
    //badge giving
    const currentUser = req.body?.currentUser;
    const unitId = req.body?.unitId;
    const userEmpId = await Users.findOne({ _id: currentUser });
    // if user is not found,throw an error
    if (!userEmpId) {
      throw new Error("User not found");
    }
    const [quizSubmission] = await QuizSubmissions.find({
      userId: currentUser,
      unitId: unitId,
    });
    if (!quizSubmission) {
      throw new Error("Unit not found");
    }
    //find the index of the user
    let currentUserRank = 0;
    const { empId } = await Users.findOne({ _id: currentUser });
    leaderboard.findIndex(
      (emp) => emp?.empId === empId && (currentUserRank = emp?.rank)
    );
    if (quizSubmission?.badgeGiven === false) {
      // if rank is less than 4
      switch (currentUserRank) {
        case 1:
          //update badgeGiven field in the quizSubmission collection
          await QuizSubmissions.updateOne(
            { userId: currentUser, unitId: unitId },
            { badgeGiven: true },
            { new: true }
          );
          //update badges array field in the user collection
          userEmpId?.badges?.push({
            badgeValue: "Gold",
            earnedOn: Date.now(),
          });
          userEmpId?.save((err) => {
            if (err) {
              throw err;
            } else {
              res.status(200).send("Gold badge added successfully");
            }
          });
          break;
        case 2:
          //update badgeGiven field in the quizSubmission collection
          await QuizSubmissions.updateOne(
            { userId: currentUser, unitId: unitId },
            { badgeGiven: true },
            { new: true }
          );
          //update badges array field in the user collection
          userEmpId?.badges.push({
            badgeValue: "Silver",
            earnedOn: Date.now(),
          });
          userEmpId?.save((err) => {
            if (err) {
              throw err;
            } else {
              res.status(200).send("Silver badge added successfully");
            }
          });
          break;
        case 3:
          //update badgeGiven field in the quizSubmission collection
          await QuizSubmissions.updateOne(
            { userId: currentUser, unitId: unitId },
            { badgeGiven: true },
            { new: true }
          );
          //update badges array field in the user collection
          userEmpId?.badges?.push({
            badgeValue: "Bronze",
            earnedOn: Date.now(),
          });
          userEmpId?.save((err) => {
            if (err) {
              throw err;
            } else {
              res.status(200).send("Bronze badge added successfully");
            }
          });
          break;
        default:
          res.json("Badge is not applicable for this user");
      }
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

badges.get("/showbadge/:currentUser", async (req, res) => {
  try {
    const currentuser = req.params.currentUser;
    const user = await Users.findOne({ empId: currentuser });

    // if user is not found
    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    // storing all badges he got upto now
    let badgeArr = [];
    user?.badges.forEach((badge) => {
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

    let badgecount = {};
    if (badgeArr.length > 0) {
      let gold = 0;
      let silver = 0;
      let bronze = 0;
      for (let countbadge of badgeArr) {
        if (countbadge === 0) {
          gold++;
        } else if (countbadge === 1) {
          silver++;
        } else if (countbadge === 2) {
          bronze++;
        }
      }
      badgecount = {
        gold,
        silver,
        bronze,
      };
    }
    res.json(badgecount);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

module.exports = badges;
