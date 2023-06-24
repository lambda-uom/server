const express = require("express");
const deletearticleRoutes = express.Router();
const deleteArticleData = require("../models/deleteArticle.model");
const moment = require("moment");

deletearticleRoutes.route("/").get(function (req, res) {
  deleteArticleData
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

deletearticleRoutes.route("/add").post(function (req, res) {
  let deletearticle = new deleteArticleData(req.body);

  // Format the updated_at date
  deletearticle.updated_at = moment().format("YYYY-MM-DD hh:mm:ss.SS A");

  deletearticle
    .save()
    .then((deletearticle) => {
      res.status(200).json({ Article: "Article history added successfully" });
    })
    .catch((err) => {
      res.status(400).send("adding new Article history failed");
    });
});

module.exports = deletearticleRoutes;
