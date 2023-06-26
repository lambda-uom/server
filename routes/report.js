const express = require("express");
const user = express.Router();

const users = require("../models/user.model");
const departments = require("../models/department.model");
const QuizSubmissions = require("../models/quizSubmission.model");
const KtSessions = require("../models/ktSession.model");
const Articles = require("../models/article.model");

user?.get("/showAllUsers", async (req, res) => {
  try {
    const usersData = await users.find();
    let finalusers = [];
    for (let user of usersData) {
      const quizSubmission = await QuizSubmissions.find({ userId: user?._id });
      const ktSession = await KtSessions.find({ createdBy: user?._id });
      const article = await Articles.find({ createdBy: user?._id });

      //checking whether they submit a quiz or kt session or article
      const validData =
        quizSubmission?.length > 0 ||
        ktSession?.length > 0 ||
        article?.length > 0;

      if (validData) {
        //get the department collection of the specific user
        const departmentCollection = await departments?.findOne({
          _id: user?.department,
        });
        //get the jobtitle name
        const jobTitle = departmentCollection?.Jobtitle?.find((jobtitle) =>
          jobtitle?._id?.equals(user?.jobPosition)
        )?.jobTitlename;
        //make object of the data to be send to frontend
        let addUserRole = {
          empId: user?.empId,
          firstName: user?.firstName,
          lastName: user?.lastName,
          userRoleValue: user?.userRole,
          depName: departmentCollection?.depName,
          userImage: user?.userImage,
          jobTitle,
        };
        //push into a final array
        finalusers.push(addUserRole);
      }
    }

    res.json(finalusers);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = user;
