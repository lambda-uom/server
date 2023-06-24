const express = require("express");
const projScore = express.Router();

const ProjectSubmissions = require("../models/finalProjectAssignment.model");
const Users = require("../models/user.model");

projScore.get("/getProjScore/:supervisorId", async (req, res) => {
  try {
    const supervisorId = req.params.supervisorId;
    const sup = await Users.findOne({ _id: supervisorId });
    if (!sup) {
      res.json({ error: "Supervisor not found" });
    }
    const submission = await ProjectSubmissions.find({
      // isProjectSubmitted: true,
    });

    let scoreData = [];
    for (let sub of submission) {
      if (sub?.projectScore !== undefined) {
        // fetching submitted employee who is belongs to supervisor's department
        const employee = await Users.findOne({
          _id: sub?.userId,
          department: sup?.department,
        });
        if (employee) {
          const empName = employee?.firstName + " " + employee?.lastName;
          const empId = employee?.empId;
          //fetching supervisor name and empId
          const supervisor = await Users.findOne({ _id: sub?.gradedBy });
          //if supervisor not found
          if (!supervisor) {
            return res.status(404).json({ error: "User not found" });
          }
          const supName = supervisor?.firstName + " " + supervisor?.lastName;
          const supId = supervisor?.empId;
          //fetching submitted time
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
          const submittedTime = sub?.submittedDate;
          let year = submittedTime?.getFullYear();
          let month = monthNames[submittedTime?.getMonth()];
          let datee = submittedTime?.getDate();
          let day = days[submittedTime?.getDay()];

          let hours = submittedTime?.getHours();
          let dayNight = hours < 13 ? "AM" : "PM";
          hours < 13 ? (hours = hours) : (hours -= 12);
          hours < 10 ? (hours = "0" + hours) : (hours = hours);

          let minutes = submittedTime?.getMinutes();
          minutes < 10 ? (minutes = "0" + minutes) : (minutes = minutes);

          let submittedOn =
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

          //fetching graded time
          const gradedTime = sub?.gradedOn;
          year = gradedTime?.getFullYear();
          month = monthNames[gradedTime?.getMonth()];
          datee = gradedTime?.getDate();
          day = days[gradedTime?.getDay()];

          hours = gradedTime?.getHours();
          dayNight = hours < 13 ? "AM" : "PM";
          hours < 13 ? (hours = hours) : (hours -= 12);
          hours < 10 ? (hours = "0" + hours) : (hours = hours);

          minutes = gradedTime?.getMinutes();
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
          //assign in a object of required data
          const subScoreData = {
            projectName: sub?.projectName,
            submittedId: empId,
            submittedName: empName,
            employeeUserImage: employee?.userImage,
            grade: sub?.projectScore,
            feedback: sub?.feedback,
            show: sub?.show,
            submittedTime: submittedOn,
            gradedId: supId,
            gradedName: supName,
            supervisorUserImage: supervisor?.userImage,
            gradedTime: gradedOn,
          };
          scoreData.push(subScoreData);
        }
      }
    }
    res.json(scoreData);
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = projScore;
