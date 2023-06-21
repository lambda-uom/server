const mongoose = require("mongoose");

const EditUnit = new mongoose.Schema(
  {
    unitName: {
      type: String,
      required: true,
    },
    unitDesc: {
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
      unitName: String,
      unitDesc: String,
    },
    updatedby: { type: mongoose.Types.ObjectId, ref: "UserData" },
  },
  {
    collection: "editunits",
  }
);

const model = mongoose.model("EditUnitData", EditUnit);
module.exports = model;
