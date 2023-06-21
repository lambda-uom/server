const mongoose = require("mongoose");
const { Schema } = mongoose;
const Department = new mongoose.Schema(
  {
    depName: { type: String, unique: true },
    createdOn: { type: Date, default: Date.now },
    Jobtitle: [
      {
        jobTitlename: { type: String },
        createdOn: { type: Date, default: Date.now },
        chaptersAllocated: [
          { type: Schema.Types.ObjectId, ref: "ChapterData" },
        ],
        reasons: [{ type: Object }],
      },
    ],
    reasons: [{ type: Object }],
  },
  {
    collection: "departments",
  }
);
const model = mongoose.model("DepartmentData", Department);
module.exports = model;
