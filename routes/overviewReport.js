const express = require("express");
const overviewReport = express.Router();

const quizSubmissions = require("../models/quizSubmission.model");
const users = require("../models/user.model");
const Chapters = require("../models/chapter.model");
const Department = require("../models/department.model");
const CommonChapters = require("../models/commonChapter.model");

overviewReport.get("/overviewReport/:empId", async (req, res) => {
  try {
    const reqEmpId = req.params.empId;
    let overviewResult = [];
    let userData = {};
    const chapters = await Chapters.find();
    if (!chapters) {
      return res.status(404).json({ error: "chapters not found" });
    }
    const commonChapters = await CommonChapters.find();
    if (!commonChapters) {
      return res.status(404).json({ error: "commonChapters not found" });
    }
    for (const chap of chapters) {
      let score = 0;
      let unitCount = 0;
      let quizSubmissionsData = await quizSubmissions.find({
        chapterId: chap?._id,
      });
      const department = await Department?.findOne({ _id: chap?.depID });
      if (!department) {
        return res.status(404).json({ error: "User not found" });
      }
      for (const quizSub of quizSubmissionsData) {
        // Retrieve the user object that matches the quiz submission user ID
        let user = await users.findOne({ _id: quizSub.userId });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        const UserDepartment = await Department?.findOne({
          _id: user?.department,
        });
        if (!UserDepartment) {
          return res.status(404).json({ error: "User not found" });
        }
        if (user?.empId === reqEmpId) {
          //  add its score to the overall score for the chapter
          score += quizSub.score;
          // increment the unit count for the chapter
          unitCount++;
          //add user data into object
          userData = {
            empId: user?.empId,
            userImage: user?.userImage,
            userDepartment: UserDepartment?.depName,
            empName: user?.firstName + " " + user?.lastName,
          };
        }
      }
      let result = {
        score,
        unitCount,
        chapterName: chap.chapterName,
        depName: department?.depName,
        average: unitCount === 0 ? 0 : score / unitCount,
      };
      //if he did any quiz in that particular chapter push into the overviewResult array
      if (result?.unitCount > 0) {
        overviewResult.push(result);
      }
    }
    for (const chap of commonChapters) {
      let score = 0;
      let unitCount = 0;
      let quizSubmissionsData = await quizSubmissions.find({
        chapterId: chap?._id,
      });
      for (const quizSub of quizSubmissionsData) {
        // Retrieve the user object that matches the quiz submission user ID
        let user = await users.findOne({ _id: quizSub.userId });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        const UserDepartment = await Department?.findOne({
          _id: user?.department,
        });
        if (!UserDepartment) {
          return res.status(404).json({ error: "User not found" });
        }
        if (user?.empId === reqEmpId) {
          //  add its score to the overall score for the chapter
          score += quizSub.score;
          // increment the unit count for the chapter
          unitCount++;
          //add user data into object
          userData = {
            empId: user?.empId,
            userImage: user?.userImage,
            userDepartment: UserDepartment?.depName,
            empName: user?.firstName + " " + user?.lastName,
          };
        }
      }
      let result = {
        score,
        unitCount,
        chapterName: chap?.chapterName,
        depName: "Common Chapter",
        average: unitCount === 0 ? 0 : score / unitCount,
      };
      //if he did any quiz in that particular chapter push into the overviewResult array
      if (result?.unitCount > 0) {
        overviewResult.push(result);
      }
    }
    res.json({ userData, overviewReportData: overviewResult });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

module.exports = overviewReport;
