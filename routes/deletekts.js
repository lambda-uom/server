const express = require("express");
const deletektRoutes = express.Router();
const deleteKTData = require("../models/deleteKT.model");
const UnitData = require("../models/unit.model");
const moment = require("moment");

deletektRoutes.route("/").get(function (req, res) {
  deleteKTData
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

deletektRoutes.route("/add").post(function (req, res) {
  let deletekt = new deleteKTData(req.body);

  // Format the updated_at date
  deletekt.updated_at = moment().format("YYYY-MM-DD hh:mm:ss.SS A");

  deletekt
    .save()
    .then((deletekt) => {
      res.status(200).json({ KT: "KT history added successfully" });
    })
    .catch((err) => {
      res.status(400).send("Adding new KT history failed");
    });
});

module.exports = deletektRoutes;
