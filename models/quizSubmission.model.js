const mongoose = require("mongoose");

const QuizSubmission = new mongoose.Schema(
  {
    quizBelongsToDepartmet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DepartmentData",
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChapterData",
      required: true,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UnitData",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    score: { type: Number },
    correctAnsCount: { type: Number },
    attemptedTime: { type: Date },
    submittedTime: { type: Date },
    questions: [
      {
        questionValue: { type: String },
        answers: [String],
        correctAnswer: { type: Number },
        submittedAnswer: { type: Number },
      },
    ],
    badgeGiven: { type: Boolean, default: false },
  },
  {
    collection: "quizsubmissions",
  }
);

const model = mongoose.model("QuizSubmissionData", QuizSubmission);
module.exports = model;
