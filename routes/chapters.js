const express = require("express");   //import express module
const chapterRoutes = express.Router();
const Chapter = require("../models/chapter.model");  //import the chapter model
const User = require("../models/user.model");
const Department = require("../models/department.model");

chapterRoutes.route("/chapters/departmentChapters/:depid/").get(function (req, res) {
  const depid = req.params.depid;
  Chapter.find({ depID: depid }, (err, chapters) => {
    if (err) {
      return res.json({ status: false, message: err })
    } else {
      return res.json(chapters);
    }
  })
});

chapterRoutes.route("/chapters").get(function (req, res) {
  res.json([
    {
      url: "http://localhost:1337/chapters/showAllChapters",  //endpoint
      method: "get",
      desc: "Shows all Chapter's data from database",
    },
  ]);
});

chapterRoutes.route("/chapters/showAllChapters").get(async (req, res) => {
  //await is used by async to wait for the result of two mongodb populate queries.
  const chapters = await Chapter.find({}).populate("depID").populate("createdBy");
  //populate method is used to replace a document's ObjectId reference fields with their actual referenced document.here the 'depID' field and the 'createdBy' field are populated with their corresponding referenced documents.
  res.json(chapters);
});

chapterRoutes.route("/chapters/isChapterAvailable").post(function (req, res) {
  const chaptername = req.body.chaptername;
  Chapter.findOne({ chaptername: chaptername }, (err, chapters) => {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      if (chapters) {
        res.json({ status: true });
        console.log(true);
      } else {
        res.json({ status: false });
        console.log(false);
      }
    }
  });
});

chapterRoutes.route("/chapters/addChapter").post(async (req, res) => {

  const chapterName = req.body.chapterName;
  const chapId = req.body.chapId;
  const depID = req.body.depID;
  const createdBy = req.body.userID;
  const createdOn = Date.now();

  const chapterDetails = new Chapter({
    chapterName,
    chapId,
    depID,
    createdBy,
    createdOn,
  });
  chapterDetails
    .save()
    .then((item) =>
      res.json({
        message: "Chapter Added Successfully",
        status: true,
      })
    )
    .catch((err) => {
      if (err.code === 11000) {
        return res.json({
          message: "Chapter already exists",
          status: false,
        });
      }
      console.log(err);
      res.status(500).send({ error: err });
    });
});

chapterRoutes.route("/chapters/editChapter").post(async (req, res) => {
  // console.log(req.body);
  newName = req.body.newName;
  reason = req.body.reason;
  editedId = req.body.editedId;
  fromName = req.body.fromName;
  // modifiedBy = req.body.modifiedBy
  const newReasonObject = {
    reasonID: Math.floor(Date.now()) / 1000,
    reasonValue: reason,
    // modifiedBy: modifiedBy,
    fromName: fromName,
    toName: newName,
  };
  try {
    const document = await Chapter.findById(editedId);
    document.reasons.push(newReasonObject);
    Chapter.updateOne(
      { _id: editedId },
      { $set: { chapterName: newName, reasons: document.reasons } }
    )
      .then((result) => {
        return res.json({
          message: "Chapter Name Updated Successfully",
          status: true,
        });
      })
      .catch((err) => {
        return res.json({
          message: "Error in Updating Chapter Name",
          status: false,
        });
      });
  } catch {
    return res.json({
      message: "Chapter Not Found. Try Again !!!",
      status: false,
    });
  }
});

chapterRoutes.route("/chapters/deleteChapter").post(async (req, res) => {
  id = req.body.id;
  try {
    const deletedChapter = await Chapter.deleteOne({ _id: id });
    return res.json({
      message: "Chapter Deleted Successfully",
      status: true,
    });
  } catch (error) {
    return res.json({
      message: "Error...!",
      status: false,
    });
  }
});

chapterRoutes.route("/chapters/:id").put(async (req, res) => {
  const { id } = req.params;
  const { status, deleteReason } = req.body;


  try {
    const updatedChapter = await Chapter.findByIdAndUpdate(
      id,
      { status: status, deleteReason: deleteReason }, // Include the delete reason in the update
      { new: true }
    );

    if (!updatedChapter) {
      return res.status(404).send({
        message: `Chapter is not found.`,
      });
    }

    res.send({
      message: `Chapter temporarily deleted successfully.`,
      data: updatedChapter,
    });
  } catch (err) {
    res.status(500).send({
      message: `Error deleting Chapter: ${err.message}`,
    });
  }
});

chapterRoutes.route("/retrievechapters/:id").put(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  Chapter.findByIdAndUpdate(id, { status: status }, { new: true })
    .then(updatedChapter => {
      if (!updatedChapter) {
        return res.status(404).send({
          message: `Chapter is not found.`
        });
      }
      res.send({
        message: `Chapter retrieved successfully.`,
        data: updatedChapter
      });
    })
    .catch(err => {
      res.status(500).send({
        message: `Error deleting Chapter : ${err.message}`
      });
    });
});

chapterRoutes.route("/chapters/enrollChapter").post(async (req, res) => {
  const chapID = req.body.chapID;
  const userID = req.body.userID;
  try {
    const document = await Chapter.findById(chapID);
    document.requested.push(userID);
    Chapter.updateOne(
      { _id: chapID },
      { $set: { requested: document.requested } }
    )
      .then((result) => {
        return res.json({
          message: "Chapter requested Successfully",
          status: true,
        });
      })
      .catch((err) => {
        return res.json({
          message: "Error in requesting Chapter Name",
          status: false,
        });
      });
  } catch {
    return res.json({
      message: "Chapter Not Found. Try Again !!!",
      status: false,
    });
  }

});

chapterRoutes.route("/chapters/getEnrolledChapters/:depID").get(async (req, res) => {
  const depID = req.params.depID;  //The value of the 'depID' parameter is assigned to a constant variable 'depID'.
  const chapters = await Chapter.find({ depID: depID, requested: { $ne: [] } })
    .populate("requested");
  res.json(chapters);
});

chapterRoutes.route("/chapters/loadAllocatedChapters/:depid/:jobid").get(function (req, res) {
  const depid = req.params.depid;
  const jobid = req.params.jobid;
  Department.findById(depid)
    .populate({ path: 'Jobtitle.chaptersAllocated', select: "_id chapterName" })
    .exec((err, departments) => {
      if (err) {
        res.json({ status: false, message: "Database Error" });
      } else {
        const chapterList = departments.Jobtitle.find((chapter) => chapter._id == jobid);
        if (chapterList) {
          res.json(chapterList);
        } else {
          res.json([]);
        }
      }
    })
});

chapterRoutes.route("/chapters/loadAdditionalChapters/:uid").get(function (req, res) {
  const uid = req.params.uid;
  User.findById(uid, { acceptedAdditionalChapter: 1 })
    .populate({ path: "acceptedAdditionalChapter", select: " _id chapterName" })
    .exec((err, users) => {
      if (err) {
        res.json({ status: false, message: "Database Error" });
      } else {
        res.json(users);
      }
    })
});

chapterRoutes.route("/chapters/acceptRequest").post(function (req, res) {
  const empid = req.body.empid;
  const chapid = req.body.chapid;
  const action = req.body.action;
  Chapter.updateOne({ _id: chapid }, { $pull: { requested: empid } }, (err, chapters) => {
    if (err) {
      console.log(err);
      res.json(
        {
          status: false,
          message: "Error in update Chapter data"
        },
      );
    } else {
      // console.log(chapters);
      if (action == 1) {
        User.updateOne({ _id: empid }, { $push: { acceptedAdditionalChapter: chapid } }, (err, users) => {
          if (err) {
            console.log(err);
            res.json(
              {
                status: false,
                message: "Error in update User data"
              },
            );
          } else {
            console.log("Success")
            res.json(
              {
                status: true,
                message: "Chapter Request Accepted successfully"
              },
            );
          }
        });
      } else {
        res.json(
          {
            status: true,
            message: "Chapter Request declined successfully"
          },
        );
      }
    }
  })
});

module.exports = chapterRoutes;



