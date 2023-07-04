const mongoose = require("mongoose");
const User = new mongoose.Schema(
  {
    userRole: { type: String },
    empId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: Date, required: true },
    phoneNumber: { type: Number, required: true },
    SubmittedOn: { type: Date, default: Date.now() }, //Date
    emailAddress: { type: String, required: true, unique: true },
    verified: { type: Boolean, default: false },
    userStatus: { type: String, default: "active" },
    userImage: { type: String },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "DepartmentData" },
    jobPosition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DepartmentData",
    },
    badges: [{ badgeValue: { type: String }, earnedOn: { type: Date } }],
    isProjectRequested: { type: Boolean, default: false },
    acceptedAdditionalChapter: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ChapterData" },
    ],
    notifications: [
      {
        message: { type: String },
        time: { type: Date, default: Date.now() },
        seen: { type: Boolean, default: false },
      }
    ]
  },
  {
    collection: "users",
  }
);

const model = mongoose.model("UserData", User);
module.exports = model;
