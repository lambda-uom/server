const express = require("express");
const deletequestionRoutes = express.Router();
const deleteQuestionData = require("../models/deletequestions.model");
const moment = require("moment");

deletequestionRoutes.route("/").get(function (req, res) {
  deleteQuestionData
    .find()
    .populate("deletedBy")
    .populate("createdBy")
    .exec(function (err, todo) {
      if (err) {
        console.log(err);
      } else {
        res.json(todo);
      }
    });
});

deletequestionRoutes.route("/add").post(function (req, res) {
  let deletequestion = new deleteQuestionData(req.body);
  // Format the updated_at date
  deletequestion.updated_at = moment().format("YYYY-MM-DD hh:mm:ss.SS A");
  deletequestion
    .save()
    .then((deletequestion) => {
      res
        .status(200)
        .json({ Questions: "Questions history added successfully" });
    })
    .catch((err) => {
      res.status(400).send("adding new Questions history failed");
    });
});

module.exports = deletequestionRoutes;
