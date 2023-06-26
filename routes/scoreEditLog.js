const express = require("express");
const scoreEditLog = express.Router();

const Users = require("../models/user.model");
const ScoreEditLog = require("../models/scoreEditLog.model");
const Department = require("../models/department.model");

scoreEditLog?.post("/storeScore", async (req, res) => {
  const { empId, score, feedback, show, projectName, gradedBy } = req.body;

  const [user] = await Users.find({ empId: empId });
  if (user !== undefined) {
    const upgradedOn = Date?.now();
    const scoreEditLog = new ScoreEditLog({
      projectName,
      submittedBy: user?._id,
      score: [],
      feedback: [],
      show: [],
      upgradedOn: [],
      upgradedBy: [],
    });

    scoreEditLog?.score.push(score);
    scoreEditLog?.feedback.push(feedback);
    scoreEditLog?.show.push(show);
    scoreEditLog?.upgradedOn.push(upgradedOn);
    scoreEditLog?.upgradedBy.push(gradedBy);

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

scoreEditLog?.put("/updateScore", async (req, res) => {
  const { empId, score, feedback, show, projectName, gradedBy } = req.body;
  const upgradedOn = Date?.now();

  let user = await Users.findOne({ empId });
  if (user !== null) {
    let scoreEditLog = await ScoreEditLog?.findOne({ submittedBy: user?._id });

    if (!scoreEditLog) {
      // If no score log exists for the user, create a new one
      scoreEditLog = new ScoreEditLog({
        projectName,
        submittedBy: user?._id,
        score: [],
        feedback: [],
        show: [],
        upgradedOn,
        upgradedBy: gradedBy,
      });
    } else {
      // If a score log already exists, update it
      scoreEditLog.projectName = projectName;
      scoreEditLog?.score.push(score);
      scoreEditLog?.feedback.push(feedback);
      scoreEditLog?.show.push(show);
      scoreEditLog?.upgradedOn.push(upgradedOn);
      scoreEditLog?.upgradedBy.push(gradedBy);
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

scoreEditLog?.get("/getScoreEditLog", async (req, res) => {
  try {
    let editlogArr = [];
    const editLog = await ScoreEditLog?.find();
    for (let editlog of editLog) {
      let editlogResult = {};
      //getting submitted employee name and empId
      const [user] = await Users.find({ _id: editlog.submittedBy });
      // if user is not found
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const userEmpId = user?.empId;
      const name = user?.firstName + " " + user?.lastName;
      const employeeUserImage = user?.userImage;

      //getting graded supervisor name
      let supervisor = [];
      for (let upgrade of editlog.upgradedBy) {
        const [upgradedBy] = await Users.find({ _id: upgrade });

        if (!upgradedBy) {
          return res.status(404).json({ error: "User not found" });
        }
        const supId = upgradedBy?.empId;
        const supName = upgradedBy?.firstName + " " + upgradedBy?.lastName;
        const supervisorUserImage = upgradedBy?.userImage;
        const supervisorDetails = {
          supId,
          supName,
          supervisorUserImage,
        };
        supervisor.push(supervisorDetails);
      }
      // formatting date and time
      let dateArr = [];
      for (let time of editlog?.upgradedOn) {
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
        let year = date?.getFullYear();
        let month = monthNames[date?.getMonth()];

        let datee = date?.getDate();
        datee < 10 ? (datee = "0" + datee) : (datee = datee);
        datee === "01" || datee === "11" || datee === "21"
          ? (datee = datee + "st".sup())
          : datee === "02" || datee === "22"
          ? (datee = datee + "nd".sup())
          : datee === "03" || datee === "13"
          ? (datee = datee + "rd".sup())
          : (datee = datee + "th".sup());

        let hours = date?.getHours();
        const dayNight = hours < 13 || hours === 0 ? "AM" : "PM";
        hours < 13 ? (hours = hours) : (hours -= 12);
        hours < 10 ? (hours = "0" + hours) : (hours = hours);

        let minutes = date?.getMinutes();
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
      const department = await Department.findOne({ _id: user?.department });
      editlogResult = {
        projectName: editlog?.projectName,
        userEmpId,
        department: department?.depName,
        employeeUserImage,
        submittedBy: name,
        show: editlog?.show,
        score: editlog?.score,
        feedback: editlog?.feedback,
        upgradedOn: dateArr,
        upgradedBy: supervisor,
      };
      editlogArr.push(editlogResult);
    }
    res.json(editlogArr);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = scoreEditLog;
