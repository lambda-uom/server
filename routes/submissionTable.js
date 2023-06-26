const express = require("express");
const submissionTable = express.Router();

const Users = require("../models/user.model");
const FinalProjectAssignments = require("../models/finalProjectAssignment.model");

submissionTable.get("/getSubmissionTable/:supervisorId", async (req, res) => {
  try {
    const supervisorId = req.params.supervisorId;
    // get supervisor department
    const sup = await Users.findOne({ _id: supervisorId });
    if (!sup) {
      res.json({ error: "Supervisor not found" });
    }

    let finalProjectAssignment = await FinalProjectAssignments.find({
      isProjectSubmitted: true,
    });
    let finalProjData = [];

    for (let finalProjAssign of finalProjectAssignment) {
      // Iterating over each final project assignment and finding submitted users who is belongs to supervisor's department
      let submittedUsers = await Users.find({
        _id: finalProjAssign?.userId,
        department: sup?.department,
      });
      for (let subUser of submittedUsers) {
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

        // Formatting submission date
        let date = finalProjAssign?.submittedDate;
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
        const dayNight = hours < "13" || hours === "00" ? "AM" : "PM";
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
        let isFileToDownload = false;
        finalProjAssign?.uploadedFileByEmployee !== undefined &&
          (isFileToDownload = true);
        // Creating submission data object and pushing to final project data array
        let submiUser = {
          empId: subUser?.empId,
          firstName: subUser?.firstName,
          lastName: subUser?.lastName,
          submittedOn,
          projectName: finalProjAssign?.projectName,
          status: finalProjAssign?.status, //whether it is graded or not
          isFileToDownload,
        };
        finalProjData.push(submiUser);
      }
    }
    res.json(finalProjData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = submissionTable;
