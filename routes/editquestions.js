const express = require("express");
const editquestionRoutes = express.Router();
const EditQuestionData = require("../models/editQuesion.model");
const moment = require("moment");

editquestionRoutes.route("/").get(function (req, res) {
  EditQuestionData.find()
    .populate("updatedby")
    .exec(function (err, todo) {
      if (err) {
        console.log(err);
      } else {
        res.json(todo);
      }
    });
});

editquestionRoutes.route("/add").post(function (req, res) {
  let editquestion = new EditQuestionData(req.body);

  // Format the updated_at date
  editquestion.updated_at = moment().format("YYYY-MM-DD hh:mm:ss.SS A");

  editquestion
    .save()
    .then((editquestion) => {
      res.status(200).json({ Article: "Article history added successfully" });
    })
    .catch((err) => {
      res.status(400).send("adding new Article history failed");
    });
});

module.exports = editquestionRoutes;
