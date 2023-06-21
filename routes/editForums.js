const express = require("express");
const editForumRoutes = express.Router();
const EditForumData = require("../models/editForum.model");
const moment = require("moment");

editForumRoutes.route("/").get(function (req, res) {
  EditForumData.find(function (err, todo) {
    if (err) {
      console.log(err);
    } else {
      res.json(todo);
    }
  });
});

editForumRoutes.route("/add").post(function (req, res) {
  let editForum = new EditForumData(req.body);

  // Format the updated_at date
  editForum.updated_at = moment().format("YYYY-MM-DD hh:mm:ss.SS A");

  editForum
    .save()
    .then((editForum) => {
      res.status(200).json({ Forum: "Forum history added successfully" });
    })
    .catch((err) => {
      res.status(400).send("adding new Forum history failed");
    });
});

module.exports = editForumRoutes;
