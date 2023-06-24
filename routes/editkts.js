const express = require("express");
const editktRoutes = express.Router();
const EditKTData = require("../models/editKT.model");
const UnitData = require("../models/unit.model");
const moment = require("moment");

editktRoutes.route("/").get(function (req, res) {
  EditKTData.find()
    .populate("updatedby")
    .exec(function (err, todo) {
      if (err) {
        console.log(err);
      } else {
        res.json(todo);
      }
    });
});

editktRoutes.route("/add").post(function (req, res) {
  let editkt = new EditKTData(req.body);

  // Format the updated_at date
  editkt.updated_at = moment().format("YYYY-MM-DD hh:mm:ss.SS A");

  editkt
    .save()
    .then((editkt) => {
      res.status(200).json({ KT: "KT history added successfully" });
    })
    .catch((err) => {
      res.status(400).send("Adding new KT history failed");
    });
});

module.exports = editktRoutes;
