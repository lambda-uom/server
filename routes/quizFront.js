const express = require("express");
const quizFront = express.Router();

const Chapters = require("../models/chapter.model");
const Units = require("../models/unit.model");
const QuizSubmissions = require("../models/quizSubmission.model");
const Departments = require("../models/department.model");
const CommonChapters = require("../models/commonChapter.model");

quizFront.get("/quizFront", async (req, res) => {
  try {
    // Retrieve all the data needed from the database
    const unitsData = await Units.find();
    const quizSubmissionData = await QuizSubmissions.find();
    const departmentsData = await Departments.find();

    let departments = [];
    const chapters = [];
    for (const dep of departmentsData) {
      const chaptersData = await Chapters.find({ depID: dep?._id });
      for (const chapter of chaptersData) {
        const units = [];

        // Only process this chapter if it has at least one unit
        if (chapter.unitsOffer.length > 0) {
          let count = 0;
          for (const unitId of chapter.unitsOffer) {
            count = 0;
            // Find the unit object that matches the unit ID
            const unit = unitsData.find(
              (unit) => unit?._id.toString() === unitId.toString()
            );

            // Count the number of quiz submissions for this unit
            for (const submission of quizSubmissionData) {
              if (submission?.unitId.toString() === unit?._id.toString()) {
                count++;
              }
            }

            // Create an object with the unit name and the count of quiz submissions and add it to the units array if there are submissions
            if (count > 0) {
              units.push({
                unitId: unit?._id,
                unitName: unit?.unitName,
                count,
              });
            }
          }
          // Create an object with the chapter name and the units data and add it to the chapters array
          count > 0 &&
            chapters?.push({
              chapterName: chapter?.chapterName,
              depName: dep?.depName,
              units,
            });
        }
      }
      departments.push(dep?.depName);
    }
    const commonChapters = await CommonChapters.find();
    for (const chapter of commonChapters) {
      const units = [];

      // Only process this chapter if it has at least one unit
      if (chapter.unitsOffer.length > 0) {
        let count = 0;
        for (const unitId of chapter.unitsOffer) {
          count = 0;
          // Find the unit object that matches the unit ID
          const unit = unitsData.find(
            (unit) => unit?._id.toString() === unitId.toString()
          );
          // Count the number of quiz submissions for this unit
          for (const submission of quizSubmissionData) {
            if (submission?.unitId.toString() === unit?._id.toString()) {
              count++;
            }
          }
          // Create an object with the unit name and the count of quiz submissions and add it to the units array if there are submissions
          if (count > 0) {
            units.push({
              unitId: unit?._id,
              unitName: unit?.unitName,
              count,
            });
          }
        }
        // Create an object with the chapter name and the units data and add it to the chapters array
        count > 0 &&
          chapters?.push({
            chapterName: chapter?.chapterName,
            depName: "Common Chapters",
            units,
          });
      }
    }
    departments.push("Common Chapters");
    res.json({ chapters, departments });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = quizFront;
