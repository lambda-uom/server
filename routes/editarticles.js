const express = require("express");
const editarticleRoutes = express.Router();
const EditArticleData = require("../models/editArticle.model");
const moment = require("moment");

editarticleRoutes.route("/").get(function (req, res) {
  EditArticleData.find()
    .populate("updatedby")
    .exec(function (err, todo) {
      if (err) {
        console.log(err);
      } else {
        res.json(todo);
      }
    });
});

editarticleRoutes.route("/add").post(function (req, res) {
  let editarticle = new EditArticleData(req.body);

  // Format the updated_at date
  editarticle.updated_at = moment().format("YYYY-MM-DD hh:mm:ss.SS A");

  editarticle
    .save()
    .then((editarticle) => {
      res.status(200).json({ Article: "Article history added successfully" });
    })
    .catch((err) => {
      res.status(400).send("adding new Article history failed");
    });
});

module.exports = editarticleRoutes;
