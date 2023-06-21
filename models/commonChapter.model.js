const mongoose = require("mongoose");
const { Schema } = mongoose;
const commonChapter = new mongoose.Schema(
    {
        chapId: { type: String, required: true, unique: true },
        chapterName: { type: String, required: true, unique: true },
        createdBy: { type: mongoose.Types.ObjectId, ref: "UserData" },
        createdOn: { type: Date, default: Date.now },
        reasons: [{ type: Object }],
        status: { type: String, default: "active" },
        unitsOffer: [{ type: mongoose.Types.ObjectId, ref: "UnitData" }],
    },
    {
        collection: "commonchapters",
    }
);
const model = mongoose.model("CommonChapterData", commonChapter);
module.exports = model;
