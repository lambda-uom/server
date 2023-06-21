const mongoose = require("mongoose");
const Forum = new mongoose.Schema(
  {
    belongsToChapter: { type: mongoose.Types.ObjectId, ref: "ChapterData" },
    topic: { type: String },
    description: { type: String },
    createdBy: { type: mongoose.Types.ObjectId, ref: "UserData" },
    createdOn: { type: Date, default: Date.now() },
    status: { type: String, default: "Active" },
    attachmentAllowed: { type: Boolean, default: false },
    posts: [
      {
        description: { type: String },
        createdBy: { type: mongoose.Types.ObjectId, ref: "UserData" },
        createdOn: { type: String },
        attachment: { type: String },
        replies: [
          {
            description: { type: String },
            attachment: { type: String },
            createdBy: { type: mongoose.Types.ObjectId, ref: "UserData" },
            createdOn: { type: String },
          },
        ],
      },
    ],
  },
  {
    collection: "forums",
  }
);
const model = mongoose.model(" ForumData", Forum);
module.exports = model;
