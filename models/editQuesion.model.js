const mongoose = require("mongoose");

const EditQuestion = new mongoose.Schema(
  {
    unitName: {
      type: String,
    },
    quizname: {
      type: String,
    },
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        type: String,
        required: true,
      },
    ],
    correctAnswer: {
      type: Number,
      required: true,
    },
    // updated_at: {
    //   type: Date,
    //   default: Date.now
    // },
    updated_at: {
      type: String,
    },
    old_data: {
      question: String,
      options: [String],
      correctAnswer: Number,
    },
    updatedby: { type: mongoose.Types.ObjectId, ref: "UserData" },
  },
  {
    collection: "editquestions",
  }
);

const model = mongoose.model("EditQuestionData", EditQuestion);
module.exports = model;
