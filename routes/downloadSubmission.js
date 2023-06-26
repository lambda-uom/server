const express = require("express");
const downloadSubmission = express.Router();

let Users = require("../models/user.model");
let FinalProjectAssignments = require("../models/finalProjectAssignment.model");

downloadSubmission.get("/getZipFile/:empId", async (req, res) => {
  try {
    let empId = req.params.empId;
    let [user] = await Users.find({ empId: empId });
    // if user is not found
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    let [projSub] = await FinalProjectAssignments.find({
      userId: user?._id,
      isProjectSubmitted: true,
    });

    //if project submission is not found
    if (!projSub) {
      return res.status(404).send({ error: "Submission not found" });
    }

    let fileURL = projSub?.uploadedFileByEmployee;
    res.json(fileURL);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = downloadSubmission;
