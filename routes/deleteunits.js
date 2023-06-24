const express = require("express");
const moment = require("moment");
const deleteunitRoutes = express.Router();
const deleteUnitData = require("../models/deleteUnit.model");

deleteunitRoutes.route("/").get(function (req, res) {
  deleteUnitData
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

deleteunitRoutes.route("/add").post(function (req, res) {
  let deleteunit = new deleteUnitData(req.body);

  // Format the updated_at date
  deleteunit.updated_at = moment().format("YYYY-MM-DD hh:mm:ss.SS A");

  deleteunit
    .save()
    .then((deleteunit) => {
      res.status(200).json({ unit: "unit history added successfully" });
    })
    .catch((err) => {
      res.status(400).send("adding new unit history failed");
    });
});

module.exports = deleteunitRoutes;
