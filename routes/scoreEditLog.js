const express = require("express");
const scoreEditLog = express.Router();

const Users = require("../models/user.model");
const ScoreEditLog = require("../models/scoreEditLog.model");

scoreEditLog.post("/storeScore", async (req, res) => {
  const { empId, score, projectName, gradedBy } = req.body;

  const [user] = await Users.find({ empId: empId });
  if (user !== undefined) {
    const upgradedOn = Date.now();
    const scoreEditLog = new ScoreEditLog({
      projectName,
      submittedBy: user?._id,
      score: [],
      upgradedOn: [],
      upgradedBy: gradedBy,
    });

    scoreEditLog.score.push(score);
    scoreEditLog.upgradedOn.push(upgradedOn);

    scoreEditLog
      .save()
      .then(() => res.json("score added successfully"))
      .catch((err) => {
        res.status(500).send(err);
      });
  } else {
    res.status(500).send("User not found");
  }
});

const ScoreEditLogs = require("../models/scoreEditLog.model");

scoreEditLog.post("/updateScore", async (req, res) => {
  const { empId, score, projectName, gradedBy } = req.body;
  const upgradedOn = Date.now();

  let user = await Users.findOne({ empId });
  if (user !== null) {
    let scoreEditLog = await ScoreEditLog.findOne({ submittedBy: user?._id });

    if (!scoreEditLog) {
      // If no score log exists for the user, create a new one
      scoreEditLog = new ScoreEditLog({
        projectName,
        submittedBy: user?._id,
        score: [],
        upgradedOn,
        upgradedBy: gradedBy,
      });
    } else {
      // If a score log already exists, update it
      scoreEditLog.projectName = projectName;
      scoreEditLog.score.push(score);
      scoreEditLog.upgradedOn.push(upgradedOn);
      scoreEditLog.upgradedBy = gradedBy;
    }

    scoreEditLog
      .save()
      .then(() => res.json("successfully upgraded"))
      .catch((err) => {
        res.status(500).send(err);
      });
  } else {
    res.status(500).send("User not found");
  }
});

scoreEditLog.get("/getScoreEditLog", async (req, res) => {
  let editlogArr = [];

  const editLog = await ScoreEditLog.find();
  for (let editlog of editLog) {
    let editlogResult = {};

    //getting submitted employee name
    const [user] = await Users.find({ _id: editlog.submittedBy });
    const name = user?.firstName + " " + user?.lastName;

    //getting graded supervisor name
    const [upgradedBy] = await Users.find({ _id: editlog.upgradedBy });
    const supName = upgradedBy?.firstName + " " + upgradedBy?.lastName;

    let dateArr = [];
    for (let time of editlog.upgradedOn) {
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

      let date = time;
      let year = date.getFullYear();
      let month = monthNames[date.getMonth()];

      let datee = date.getDate();
      datee < 10 ? (datee = "0" + datee) : (datee = datee);
      datee === "01" || datee === "11" || datee === "21"
        ? (datee = datee + "st".sup())
        : datee === "02" || datee === "22"
        ? (datee = datee + "nd".sup())
        : datee === "03" || datee === "13"
        ? (datee = datee + "rd".sup())
        : (datee = datee + "th".sup());

      let hours = date.getHours();
      const dayNight = hours < 13 || hours === 00 ? "AM" : "PM";
      hours < 13 ? (hours = hours) : (hours -= 12);
      hours < 10 ? (hours = "0" + hours) : (hours = hours);

      let minutes = date.getMinutes();
      minutes < 10 ? (minutes = "0" + minutes) : (minutes = minutes);
      let submittedOn =
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
      dateArr.push(submittedOn);
    }
    editlogResult = {
      projectName: editlog.projectName,
      submittedBy: name,
      score: editlog.score,
      upgradedOn: dateArr,
      upgradedBy: supName,
    };
    editlogArr.push(editlogResult);
  }
  res.json(editlogArr);
});

module.exports = scoreEditLog;
