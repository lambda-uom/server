const express = require("express");
const chapterReport = express.Router();

const quizSubmissions = require("../models/quizSubmission.model");
const users = require("../models/user.model");
const Chapters = require("../models/chapter.model");
const Units = require("../models/unit.model");
const CommonChapters = require("../models/commonChapter.model");

chapterReport.get("/chapterReport/:empId", async (req, res) => {
  try {
    let reqEmpId = req?.params?.empId;
    let userData = {};
    let chapterResults = [];
    let chapters = await Chapters.find();
    // if chapters not found,send 404
    if (!chapters) {
      return res.status(404).json({ error: "chapters not found" });
    }
    let commonChapters = await CommonChapters.find();
    // if chapters not found,send 404
    if (!commonChapters) {
      return res.status(404).json({ error: "commonChapters not found" });
    }
    for (let chap of chapters) {
      let chapterUnit = {};
      let unitData = [];
      let quizSubmissionsData = await quizSubmissions.find({
        chapterId: chap?._id,
      });
      //if quiz data not found,send 404
      if (!quizSubmissionsData) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      for (let quizSub of quizSubmissionsData) {
        let user = await users?.findOne({ _id: quizSub?.userId });
        //if user data not found,send 404
        if (!user) {
          return res.status(404).json({ error: "user not found" });
        }
        // If user's empId matches requested empId,
        if (user?.empId === reqEmpId) {
          userData = {
            empId: user?.empId,
            userImage: user?.userImage,
            empName: user?.firstName + " " + user?.lastName,
          };
          let units = await Units.find({ _id: quizSub?.unitId });
          //if units data not found,send 404
          if (!units) {
            return res.status(404).json({ error: "units not found" });
          }
          //add unitName and score of the unit's quiz
          for (let unit of units) {
            chapterUnit = {
              unitName: unit?.unitName,
              score: quizSub?.score,
            };
          }
          // Add chapterUnit to unit array
          unitData.push(chapterUnit);
        }
      }
      // If unit array is not empty, add chapter name and unit array to chapterResults
      if (unitData.length > 0)
        chapterResults.push({
          chapterName: chap?.chapterName,
          units: unitData,
        });
    }
    for (let chap of commonChapters) {
      let chapterUnit = {};
      let unitData = [];
      let quizSubmissionsData = await quizSubmissions.find({
        chapterId: chap?._id,
      });
      //if quiz data not found,send 404
      if (!quizSubmissionsData) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      for (let quizSub of quizSubmissionsData) {
        let user = await users?.findOne({ _id: quizSub?.userId });
        //if user data not found,send 404
        if (!user) {
          return res.status(404).json({ error: "user not found" });
        }
        // If user's empId matches requested empId,
        if (user?.empId === reqEmpId) {
          userData = {
            empId: user?.empId,
            userImage: user?.userImage,
            empName: user?.firstName + " " + user?.lastName,
          };
          let units = await Units.find({ _id: quizSub?.unitId });
          //if units data not found,send 404
          if (!units) {
            return res.status(404).json({ error: "units not found" });
          }
          //add unitName and score of the unit's quiz
          for (let unit of units) {
            chapterUnit = {
              unitName: unit?.unitName,
              score: quizSub?.score,
            };
          }
          // Add chapterUnit to unit array
          unitData.push(chapterUnit);
        }
      }
      // If unit array is not empty, add chapter name and unit array to chapterResults
      if (unitData.length > 0)
        chapterResults.push({
          chapterName: chap?.chapterName,
          units: unitData,
        });
    }
    res.json({ chapterReportData: chapterResults, userData });
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = chapterReport;
