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
    let leaderboardCount = 0;
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
            leaderboardCount++;
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
    // get previous leaderboardCount field in the department collection
    const previousLeaderboard = await Departments.findOne({
      _id: currentUserDep,
    });
    if (!previousLeaderboard) {
      res.json({ message: "Department not found" });
    }
    const prevLboardCount = previousLeaderboard?.leaderboardCount;
    //update leaderboardCount field in the department collection
    await Departments.findOneAndUpdate(
      { _id: currentUserDep },
      { leaderboardCount: leaderboardCount }
    );

    // if leaderboardCount field is changed, give badges to the employees
    if (prevLboardCount !== leaderboardCount) {
      //badge giving
      const currentUser = req.body?.currentUser;
      const unitId = req.body?.unitId;
      const userEmpId = await Users.findOne({ _id: currentUser });
      // if user is not found,throw an error
      if (!userEmpId) {
        res.json({ message: "User not found" });
      }
      const [quizSubmission] = await QuizSubmissions.find({
        userId: currentUser,
        unitId: unitId,
      });
      if (!quizSubmission) {
        res.json({ message: "Unit not found" });
      }
      for (let lbdata of leaderboard) {
        let lbUser = await Users.findOne({ empId: lbdata?.empId });
        if (!lbUser) {
          res.json({ message: "User not found" });
        }
        let currentUserRank = lbdata?.rank;
        if (quizSubmission?.badgeGiven === false) {
          // if rank is less than 4
          switch (currentUserRank) {
            case 1:
              //update badgeGiven field in the quizSubmission collection
              await QuizSubmissions.findOneAndUpdate(
                { userId: currentUser, unitId: unitId },
                { badgeGiven: true }
              );
              //update badges array field in the user collection
              lbUser?.badges?.push({
                badgeValue: "Gold",
                earnedOn: Date.now(),
              });
              lbUser?.save((err) => {
                if (err) {
                  throw err;
                }
              });
              break;
            case 2:
              //update badgeGiven field in the quizSubmission collection
              await QuizSubmissions.findOneAndUpdate(
                { userId: currentUser, unitId: unitId },
                { badgeGiven: true }
              );
              //update badges array field in the user collection
              lbUser?.badges.push({
                badgeValue: "Silver",
                earnedOn: Date.now(),
              });
              lbUser?.save((err) => {
                if (err) {
                  throw err;
                }
              });
              break;
            case 3:
              //update badgeGiven field in the quizSubmission collection
              await QuizSubmissions.findOneAndUpdate(
                { userId: currentUser, unitId: unitId },
                { badgeGiven: true }
              );
              //update badges array field in the user collection
              lbUser?.badges?.push({
                badgeValue: "Bronze",
                earnedOn: Date.now(),
              });
              lbUser?.save((err) => {
                if (err) {
                  throw err;
                }
              });
              break;
            default:
              //update badgeGiven field in the quizSubmission collection
              await QuizSubmissions.findOneAndUpdate(
                { userId: currentUser, unitId: unitId },
                { badgeGiven: true }
              );
              break;
          }
        }
      }
      res.json("badges are added successfully");
    } else {
      res.json("badges are already given");
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
