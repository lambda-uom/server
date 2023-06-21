const mongoose = require("mongoose");

const EditForum = new mongoose.Schema(
  {
    chapterName: {
      type: String,
      required: true,
    },
    forumTopic: {
      type: String,
      required: true,
    },
    forumDesc: {
      type: String,
      required: true,
    },
    attachmentStatus: { type: Boolean, default: false },

    updated_at: {
      type: String,
    },
    old_data: {
      topic: String,
      description: String,
      attachmentAllowed: Boolean,
    },
    updatedby: { type: mongoose.Types.ObjectId, ref: "UserData" },
  },
  {
    collection: "editforums",
  }
);

const model = mongoose.model("EditForumData", EditForum);
module.exports = model;
