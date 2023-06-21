const express = require("express");
const assignmentRoute = express.Router();
const User = require('../models/user.model');
// const Notification = require('../models/Notification.model');
const FinalProjectAssignment = require("../models/finalProjectAssignment.model");
const path = require("path");
const { finalAssignmentAttachmentUpload } = require("../multer/finalAssignmentAttachments-config")
const { finalAssignmentSubmissionsUpload } = require("../multer/finalAssignmentSubmissions-config")
const { MulterError } = require('multer');
const mongoose = require('mongoose');
const fs = require("fs");


assignmentRoute.use(
    '/download/submission-attachments/',
    express.static(path.join(__dirname, '../uploads/finalAssignmentAttachments'))
);

assignmentRoute.use(
    '/download/submissions/',
    express.static(path.join(__dirname, '../uploads/finalAssignmentSubmissions'))
);

const findMulterError = () => {
    return (err, req, res, next) => {
        if (err instanceof MulterError) {
            console.log("Response sent: too large")
            return res.json({ status: false, message: "File is too large. Assignment submission failed !" });
        } else if (err instanceof Error) {
            console.log("response sent type error")
            return res.json({ status: false, message: "File type is not allowed. Assignment submission failed !" });
        }
        next();
    }
}

// Routes Starts Here...

assignmentRoute.route("/finalprojectassignment/getOneAssignment/:userid").get(async (req, res) => {
    const userID = req.params.userid;
    const assignments = await FinalProjectAssignment.findOne({ userId: userID })
        .populate(
            {
                path: "acceptedBy",
                select: "userRole empId firstName lastName phoneNumber emailAddress userImage department"
            }
        );
    res.json([assignments]);
});

assignmentRoute.route("/finalprojectassignment/getOverDuedAssignments/:depid").get(async (req, res) => {
    const overDuedAssignments = await FinalProjectAssignment.find({ projectDeadLine: { $lte: new Date().toISOString() }, departmentId: req.params.depid })
        .populate(
            {
                path: "acceptedBy",
                select: "empId firstName lastName phoneNumber emailAddress userImage department"
            }
        )
        .populate(
            {
                path: "userId",
                select: "empId firstName lastName phoneNumber emailAddress userImage department"
            }
        );
    res.json(overDuedAssignments);
});


assignmentRoute.route("/finalprojectassignment/getOneAssignmentByProjectID/:id").get(async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.json({
            message: "Invalid ID Found",
            status: false,
        });
    }
    const assignments = await FinalProjectAssignment.findOne({ _id: id })
        .populate(
            {
                path: "acceptedBy",
                select: "userRole empId firstName lastName phoneNumber emailAddress userImage department"
            }
        );
    res.json([assignments]);
});

assignmentRoute.route("/finalprojectassignment/getAssigned/:depid").get(async (req, res) => {
    const assignments = await FinalProjectAssignment.find(
        {
            isProjectAssigned: true,
            isProjectSubmitted: false,
            departmentId: req.params.depid,
            projectDeadLine: { $gte: new Date().toISOString() }
        }
    )
        .populate(
            {
                path: "acceptedBy",
                select: "empId firstName lastName phoneNumber emailAddress userImage department"
            }
        )
        .populate(
            {
                path: "userId",
                select: "empId firstName lastName phoneNumber emailAddress userImage department"
            }
        );
    res.json(assignments);
});

assignmentRoute.route("/finalprojectassignment/isProjectAssigned/:id").get(async (req, res) => {
    const userID = req.params.id;
    const assignments = await FinalProjectAssignment.findOne({ userId: userID })
    if (assignments) {
        if (assignments.isProjectAssigned === true) {
            res.json({ "status": true });
        } else {
            res.json({ "status": false });
        }
    } else {
        res.json({ "status": false });
    }

});

assignmentRoute.route("/addFinalAssignment").post(
    finalAssignmentAttachmentUpload.single("ufile"),
    findMulterError(),
    (req, res) => {
        try {
            const requestedBy = req?.body?.requestedby;
            if (!mongoose.Types.ObjectId.isValid(req.body.finalprojectassignmentid)) {
                return res.json({
                    message: "Invalid ID Found",
                    status: false,
                });
            }
            let updateObject;
            if (req?.file) {
                updateObject = {
                    projectName: req.body.title,
                    projectDescription: req.body.description,
                    projectDeadLine: req.body.deadline,
                    uploadedFileBySupervisor: "http://localhost:1337/download/submission-attachments/" + req.file.filename,
                    supAttachOriginalName: req.file.originalname,
                    supAttachFileSize: req.file.size,
                    acceptedBy: req.body.supervisor,
                    isProjectAssigned: true,
                    assignedOn: Date.now()
                }
            } else {
                updateObject = {
                    projectName: req.body.title,
                    projectDescription: req.body.description,
                    projectDeadLine: req.body.deadline,
                    acceptedBy: req.body.supervisor,
                    isProjectAssigned: true,
                    assignedOn: Date.now()
                }
            }
            FinalProjectAssignment.updateOne(
                { _id: req.body.finalprojectassignmentid },
                { $set: updateObject },
                async function (err, result) {
                    if (!err) {
                        try {
                            const user = await User.findById(requestedBy);
                            user.notifications.push({ message: "Your final project has been assigned" });
                            user.save();
                        } catch (err) {
                            console.log(err);
                        }
                        res.json({ status: true, message: "Final Project Assigned Successfully" });
                    } else {
                        res.json({ status: false, message: "Error in Submission" });
                    }
                }
            );
        } catch (err) {
            console.log(err);
            res.json({ status: false, message: "Backend Error" });
        }
    });

assignmentRoute.route("/addFinalProjectSubmission").post(
    finalAssignmentSubmissionsUpload.single("ufile"),
    findMulterError(),
    (req, res) => {
        const supervisor = req.body.supervisor;
        try {
            if (!mongoose.Types.ObjectId.isValid(req.body.finalProjectAssignmentID)) {
                return res.json({
                    message: "Invalid ID Found",
                    status: false,
                });
            }
            let updateObject;
            if (req?.file) {
                console.log("File Found")
                updateObject = {
                    uploadedDescriptionByEmployee: req.body.note,
                    uploadedFileByEmployee: "http://localhost:1337/download/submissions/" + req.file.filename,
                    empAttachOriginalName: req.file.originalname,
                    empAttachFileSize: req.file.size,
                    submittedDate: Date.now(),
                    isProjectSubmitted: true
                }
            } else {
                console.log("File not found")
                updateObject = {
                    uploadedDescriptionByEmployee: req.body.note,
                    submittedDate: Date.now(),
                    isProjectSubmitted: true
                }
            }
            FinalProjectAssignment.updateOne(
                { _id: req.body.finalProjectAssignmentID },
                { $set: updateObject },
                async function (err, result) {
                    if (!err) {
                        const user = await User.findById(supervisor);
                        user.notifications.push({ message: "The final project you assigned is submitted" });
                        user.save();
                        res.json({ status: true, message: "Final Project Submitted Successfully" });
                    } else {
                        res.json({ status: false, message: "Error in Submission" });
                    }
                }
            );
        } catch (err) {
            console.log(err);
            res.json({ status: false, message: "Backend Error" });
        }
    });

assignmentRoute.route("/finalprojectassignment/request/:uid/:did").get((req, res) => {
    try {
        const userId = req.params.uid;
        const departmentId = req.params.did;
        const data = { userId, departmentId }
        const newFinalProjectAssignment = new FinalProjectAssignment(data);
        FinalProjectAssignment.findOne({ userId: userId }, (err, data) => {
            if (data) {
                return res.json({ status: false, message: "Already Requested. Final Project Assignment in progress." });
            } else {
                newFinalProjectAssignment.save()
                    .then(() => {
                        User.updateMany(
                            { userRole: "Supervisor", department: departmentId },
                            { $push: { notifications: { message: "Final Project Assignment is Requested" } } }
                        ).then(() => {
                            res.json({ status: true, message: "Final Project Requested Successfully" });
                        }).catch((error) => {
                            res.json({ status: true, message: "Final Project Requested Successfully" });
                        })
                    })
                    .catch((err) => {
                        res.json({ status: false, message: "Error in Request Final Project" });
                        console.error(err);
                    })
            }
        })
    } catch (err) {
        console.log(err);
        res.json({ status: false, message: "Backend Error" });
    }
});

assignmentRoute.route("/finalprojectassignment/showRequests/:depid").get(async (req, res) => {
    const assignments = await FinalProjectAssignment.find({ isProjectAssigned: false, departmentId: req.params.depid })
        .populate(
            {
                path: "userId",
                select: "firstName lastName phoneNumber emailAddress userImage "
            }
        )
    res.json(assignments);
});

assignmentRoute.route("/finalprojectassignment/updateFinalProjectAssignment").post(
    finalAssignmentAttachmentUpload.single("newFile"),
    findMulterError(),
    (req, res) => {
        const newTitle = req.body.title
        const newDescription = req.body.description
        const newDeadLine = req.body.deadline
        const finalProjectAssignmentID = req.body.finalprojectassignmentid
        const newFileData = req?.file
        if (!mongoose.Types.ObjectId.isValid(finalProjectAssignmentID)) {
            return res.json({
                message: "Invalid ID Found",
                status: false,
            });
        }
        let setObject;
        if (newFileData) {
            setObject = {
                projectDescription: newDescription,
                projectDeadLine: newDeadLine,
                projectName: newTitle,
                uploadedFileBySupervisor: "http://localhost:1337/download/submission-attachments/" + newFileData.filename,
                supAttachOriginalName: req.file.originalname,
                supAttachFileSize: req.file.size,
                assignedOn: Date.now()
            }
        } else {
            if (req.body.needtoDeleteAttachment === "true") {
                setObject = {
                    projectDescription: newDescription,
                    projectDeadLine: newDeadLine,
                    projectName: newTitle,
                    assignedOn: Date.now(),
                    uploadedFileBySupervisor: "",
                    supAttachOriginalName: "",
                    supAttachFileSize: "",
                }
            } else {
                setObject = {
                    projectDescription: newDescription,
                    projectDeadLine: newDeadLine,
                    projectName: newTitle,
                    assignedOn: Date.now()
                }
            }
        }
        try {
            FinalProjectAssignment.updateOne(
                { _id: finalProjectAssignmentID },
                { $set: setObject }
            ).then((result) => {
                return res.json({
                    message: "Final Project Assignment Updated Successfully",
                    status: true,
                });
            })
                .catch((err) => {
                    return res.json({
                        message: "Error in Updating Final Project Assignment",
                        status: false,
                    });
                });
        } catch (err) {
            return res.json({
                message: err,
                status: false,
            });
        }

    });

assignmentRoute.route("/finalprojectassignment/deleteAssignedAssignment").post(async (req, res) => {
    const projectID = req.body.projectID;
    try {
        const assignments = await FinalProjectAssignment.findOne({ _id: projectID })
        if (assignments) {
            assignments.isProjectAssigned = false;
            assignments.acceptedBy = undefined;
            assignments.assignedOn = undefined;
            assignments.projectDeadLine = undefined;
            assignments.projectDescription = undefined;
            assignments.projectName = undefined;
            assignments.supAttachFileSize = undefined;
            assignments.supAttachOriginalName = undefined;
            assignments.uploadedFileBySupervisor = undefined;
            await assignments.save();
            return res.json({
                message: "Final Project Assignment Deleted Successfully",
                status: true,
            });

            // This is also possible
            // await assignments.updateOne(assignments);
        }
    } catch (e) {
        console.log(error);
        return res.json({
            message: "Deleting Project Assignment Failed",
            status: false,
        });
    }
});

module.exports = assignmentRoute;