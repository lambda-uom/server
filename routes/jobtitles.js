const express = require("express");
const jobtitleRoutes = express.Router();
const Department = require("../models/department.model");
const User = require("../models/user.model")
require("dotenv").config();

//-----------------------------------------------------------------------------------------------
jobtitleRoutes.route("/jobtitles").get(function (req, res) {
  res.json([
    {
      url: process.env.BACKEND_ADDRESS+"/jobtitles/showAllJobtitles",
      method: "get",
      desc: "Shows all jobtitle's data from database",
    },
  ]);
});
//-----------------------------------------------------------------------------------------------
jobtitleRoutes.route("/jobtitles/showAllJobtitles").get(function (req, res) {
  Department.find({}, (err, jobtitles) => {
    if (err) {
      res.send(err);
    } else {
      res.json(jobtitles);
    }
  });
});
//----------------------------------------------------------------------------------------------
jobtitleRoutes
  .route("/jobtitles/isJobtitleAvailable")
  .post(function (req, res) {
    const jobTitlename = req.body.jobTitlename;
    Jobtitle.findOne({ jobtitlename: jobTitlename }, (err, jobtitles) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        if (jobtitles) {
          res.json({ status: true });
          console.log(true);
        } else {
          res.json({ status: false });
          console.log(false);
        }
      }
    });
  });
//-------------------------------------------------------------------------------------------
jobtitleRoutes.route("/jobtitles/addJobtitle").post(async (req, res) => {
  const jobTitlename = req.body.jobtitleName;
  const depID = req.body.depID;

  try {
    const department = await Department.findById(depID);
    if (!department) {
      return res.json({
        message: "Department not found",
        status: false,
      });
    }

    const existingJobTitle = department.Jobtitle.find(
      (jobtitle) => jobtitle.jobTitlename.toLowerCase() === jobTitlename.toLowerCase()
    );
    if (existingJobTitle) {
      return res.json({
        message: "Jobtitle already exists",
        status: false,
      });
    }

    const createdOn = Date.now();
    department.Jobtitle.push({ jobTitlename, createdOn });
    await department.save();

    return res.json({
      message: "Jobtitle Added Successfully",
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      message: "Error adding jobtitle",
      status: false,
    });
  }
});

//-----------------------------------------------------------------------------------------
jobtitleRoutes.route("/jobtitles/editJobtitle").post(async (req, res) => {
  newName = req.body.newName;
  reason = req.body.reason;
  editedId = req.body.editedId;
  fromName = req.body.fromName;
  const departments = await Department.findOne({ "Jobtitle._id": editedId });
  if (departments === null) {
    return res.json({
      message: "Jobtitle Not Found !",
      status: false,
    });
  }
  const jobtitle = (departments.Jobtitle).filter(e => (e._id).equals(editedId))[0]

  const existingJobTitle = departments.Jobtitle.find(
    (e) => e.jobTitlename.toLowerCase() === newName.toLowerCase()
  );
  if (existingJobTitle && !existingJobTitle._id.equals(editedId)) {
    return res.json({
      message: "Jobtitle already exists",
      status: false,
    });
  }

  jobtitle.reasons.push({
    reasonID: Date.now(),
    fromName: jobtitle.jobTitlename,
    newName: newName,
    reason: reason
  })


  jobtitle.jobTitlename = newName;
  departments.save((err, data) => {
    if (data) {
      return res.json({
        message: "Jobtitle Name Updated Successfully",
        status: true,
      });
    } else {
      return res.json({
        message: "Error in Updating Jobtitle Name",
        status: false,
      });
    }
  })
});

//------------------------------------------------------------------------------------------
jobtitleRoutes.route("/jobtitles/deleteJobtitle").post(async (req, res) => {
  const id = req.body.id;
  try {
    const departments = await Department.findOne({ "Jobtitle._id": id });

    // Check if any verified user is associated with the job title
    const verifiedUserCount = await User.countDocuments({ verified: true, jobPosition: id });
    if (verifiedUserCount > 0) {
      return res.json({
        message: "Cannot delete this Jobtitle.Users are associated with it.",
        status: false,
      });
    }
    // Remove the job title from the Jobtitle array
    departments.Jobtitle = departments.Jobtitle.filter(
      (jobtitle) => jobtitle._id.toString() !== id
    );
    // Save the updated Department object
    await departments.save();

    return res.json({
      message: "Jobtitle deleted successfully",
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      message: "Error deleting jobtitle",
      status: false,
    });
  }
})

//----------------------------------------------------------------------------------------------
jobtitleRoutes.route("/jobtitles/allocatechapter").post(async (req, res) => {
  chaptersAllocated = req.body.chaptersAllocated;
  editedId = req.body.editedId;

  const departments = await Department.findOne({ "Jobtitle._id": editedId });
  if (departments === null) {
    return res.json({
      message: "Chapter allocated Not Found !",
      status: false,
    });
  }
  const jobtitle = (departments.Jobtitle).filter(e => (e._id).equals(editedId))[0]
  jobtitle.chaptersAllocated = chaptersAllocated;
  departments.save((err, data) => {
    if (data) {
      return res.json({
        message: "Default chapters allocated Successfully",
        status: true,
      });
    } else {
      return res.json({
        message: "Error in Allocating default chapters",
        status: false,
      });
    }
  })
});

module.exports = jobtitleRoutes;




//before the existing jobtitle validation- addjobtitle

// jobtitleRoutes.route("/jobtitles/addJobtitle").post(async (req, res) => {
//   const jobTitlename = req.body.jobtitleName;
//   const depID = req.body.depID;
//   // //const createdBy = "Name";
//   const createdOn = Date.now();

//   Department.findById(depID, (err, department) => {
//     if (err) {
//       console.log(err);
//     } else {
//       // Add some new marks to the array
//       department.Jobtitle.push({ jobTitlename: jobTitlename, createdOn: createdOn });
//       // Save the updated document
//       department.save((err) => {
//         if (err) {
//           console.log(err);
//         } else {
//           res.json({
//             message: "Jobtitle Added Successfully",
//             status: true,
//           })
//         }
//       });
//     }
//   });

// });