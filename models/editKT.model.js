const mongoose = require("mongoose");

const EditKT = new mongoose.Schema(
  {
    unitName: {
      type: String,
      required: true,
    },
    sessionName: {
      type: String,
      required: true,
    },
    sessionDesc: {
      type: String,
      required: true,
    },
    // updated_at: {
    //   type: Date,
    //   default: Date.now
    // },
    updated_at: {
      type: String,
    },
    old_data: {
      sessionName: String,
      sessionDesc: String,
    },
    updatedby: { type: mongoose.Types.ObjectId, ref: "UserData" },
  },
  {
    collection: "editkts",
  }
);

const model = mongoose.model("EditKTData", EditKT);
module.exports = model;
