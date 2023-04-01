const express = require("express");
const feedback = express.Router();

const FinalProjSubmission = require("../models/finalProjectAssignment.model");
const Users = require("../models/user.model");

feedback.get("/getFeedback/:currentUser", async (req, res) => {
  const currentUser = req.params.currentUser;
  const projSubmi = await FinalProjSubmission.findOne({ userId: currentUser });
  let feedbackData = {};
  if (projSubmi.show) {
    const { firstName, lastName } = await Users.findOne({
      _id: projSubmi.gradedBy,
    });
    const supName = firstName + " " + lastName;

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let date = projSubmi.gradedOn;
    let year = date.getFullYear();
    let month = monthNames[date.getMonth()];
    let datee = date.getDate();
    let day = days[date.getDay()];

    let hours = date.getHours();
    const dayNight = hours < 13 ? "AM" : "PM";
    hours < 13 ? (hours = hours) : (hours -= 12);
    hours < 10 ? (hours = "0" + hours) : (hours = hours);

    let minutes = date.getMinutes();
    minutes < 10 ? (minutes = "0" + minutes) : (minutes = minutes);

    let gradedOn =
      day +
      ", " +
      datee +
      " " +
      month +
      " " +
      year +
      ", " +
      hours +
      ":" +
      minutes +
      " " +
      dayNight;

    feedbackData = {
      score: projSubmi.projectScore,
      feedback: projSubmi.feedback,
      gradedOn,
      gradedBy: supName,
      show: projSubmi.show,
    };
  } else {
    feedbackData = {
      show: projSubmi.show,
    };
  }
  res.json(feedbackData);
});

module.exports = feedback;
