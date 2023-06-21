const express = require("express");   //import express module
const commonchapterRoutes = express.Router();
const Chapter = require("../models/commonChapter.model");  //import the chapter model
const User = require("../models/user.model");



commonchapterRoutes.route("/commonchapters").get(function (req, res) {
    res.json([
        {
            url: "http://localhost:1337/commonchapters/showAllChapters",  //endpoint
            method: "get",
            desc: "Shows all common Chapter's data from database",
        },
    ]);
});

commonchapterRoutes.route("/commonchapters/showAllChapters").get(async (req, res) => {
    //await is used by async to wait for the result of two mongodb populate queries.
    const commonchapters = await Chapter.find({}).populate("createdBy");
    //populate method is used to replace a document's ObjectId reference fields with their actual referenced document.here the 'depID' field and the 'createdBy' field are populated with their corresponding referenced documents.
    res.json(commonchapters);
});

commonchapterRoutes.route("/commonchapters/isChapterAvailable").post(function (req, res) {
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

//----------------------------------------------------------------------------------------

commonchapterRoutes.route("/commonchapters/addChapter").post(async (req, res) => {

    const chapterName = req.body.chapterName;
    const chapId = req.body.chapId;
    const createdBy = req.body.userID;
    const createdOn = Date.now();

    const chapterDetails = new Chapter({
        chapterName,
        chapId,
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
//----------------------------------------------------------------------------------

commonchapterRoutes.route("/commonchapters/editChapter").post(async (req, res) => {
    // console.log(req.body);
    newName = req.body.newName;
    reason = req.body.reason;
    editedId = req.body.editedId;
    fromName = req.body.fromName;
    modifiedBy = req.body.modifiedBy
    const newReasonObject = {
        reasonID: Math.floor(Date.now()) / 1000,
        reasonValue: reason,
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
// ------------------------------------------------------------------------------

commonchapterRoutes.route("/commonchapters/deleteChapter").post(async (req, res) => {
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


//------------------------------------------------------------------------------------------



module.exports = commonchapterRoutes;


