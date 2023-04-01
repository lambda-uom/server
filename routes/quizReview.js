const express = require("express");
const review = express.Router();

const QuizSubmissions = require("../models/quizSubmission.model");
const Units = require("../models/unit.model");

review.get("/review/:currentUser/:unitId", async (req, res) => {
  const currentUser = req.params.currentUser;
  const unitId = req.params.unitId;
  //getting required user's submission
  const user = await QuizSubmissions.findOne({
    userId: currentUser,
    unitId: unitId,
  });
  let data = {};
  //check whether use is found or
  if (user !== null) {
    //getting required unit name
    const unit = await Units.findOne({ _id: unitId });
    const unitName = unit?.unitName;
    if (unit !== null) {
      let reviewData = [];
      user?.questions?.map((question) => {
        //check whether the submitted answer is correct or not
        let checkedStatus = false;
        if (question.correctAnswer === question.submittedAnswer) {
          checkedStatus = true;
        }
        let questData = {
          question: question.questionValue,
          answers: question.answers,
          submittedAnswer: question.submittedAnswer,
          correctAnswer: question.correctAnswer,
          checkedStatus,
        };
        reviewData.push(questData);
      });
      data = {
        unitName,
        reviewData,
      };
    }
  }
  res.json(data);
});

module.exports = review;
