const express = require("express");
const moment = require("moment");
const editunitRoutes = express.Router();
const EditUnitData = require("../models/editunit.model");

editunitRoutes.route("/").get(function (req, res) {
  EditUnitData.find()
    .populate("updatedby")
    .exec(function (err, todo) {
      if (err) {
        console.log(err);
      } else {
        res.json(todo);
      }
    });
});

editunitRoutes.route("/add").post(function (req, res) {
  let editunit = new EditUnitData(req.body);

  // Format the updated_at date
  editunit.updated_at = moment().format("YYYY-MM-DD hh:mm:ss.SS A");

  editunit
    .save()
    .then((editunit) => {
      res.status(200).json({ unit: "unit history added successfully" });
    })
    .catch((err) => {
      res.status(400).send("adding new unit history failed");
    });
});

module.exports = editunitRoutes;
