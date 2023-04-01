const express = require("express");
const result = express.Router();

const QuizSubmissions = require("../models/quizSubmission.model");
const Units = require("../models/unit.model");

result.get("/result/:currentUser/:unitId", async (req, res) => {
  const currentUser = req.params.currentUser;
  const unitId = req.params.unitId;
  //getting required user's submission
  const user = await QuizSubmissions.findOne({
    userId: currentUser,
    unitId: unitId,
  });
  let data = {};
  if (user !== null) {
    //getting user name
    const unit = await Units.findOne({ _id: unitId });
    const unitName = unit?.unitName;
    if (unit !== null) {
      //getting no of correct answers
      let correctAnsCount = 0;
      user?.questions?.map((question) => {
        if (question.correctAnswer === question.submittedAnswer) {
          correctAnsCount++;
        }
      });
      //calculating score out of 100
      let score = ((correctAnsCount / user?.questions.length) * 100).toFixed(2);

      //updating the no of correct answers in the database
      await QuizSubmissions.updateOne(
        {
          userId: currentUser,
          unitId: unitId,
        },
        { correctAnsCount, score }
      );
      //calculating time duration
      let timeTaken = user?.submittedTime - user?.attemptedTime;
      let hour = Math.floor(timeTaken / (60 * 60 * 1000));
      let min = Math.floor((timeTaken % 3600000) / (60 * 1000));
      let sec = Math.floor((timeTaken % 60000) / 1000);
      hour < 10 ? (hour = "0" + hour) : (hour = hour);
      min < 10 ? (min = "0" + min) : (min = min);
      sec < 10 ? (sec = "0" + sec) : (sec = sec);

      timeTaken = hour + ":" + min + ":" + sec;

      let totalNumOfQuestions = user?.questions?.length;

      correctAnsCount < 10
        ? (correctAnsCount = "0" + correctAnsCount)
        : (correctAnsCount = correctAnsCount);
      totalNumOfQuestions < 10
        ? (totalNumOfQuestions = "0" + totalNumOfQuestions)
        : (totalNumOfQuestions = totalNumOfQuestions);

      data = {
        unitName,
        numOfCorrectAns: correctAnsCount,
        totalNumOfQuestions,
        timeTaken,
        score,
      };
    }
  }
  res.json(data);
});

module.exports = result;
