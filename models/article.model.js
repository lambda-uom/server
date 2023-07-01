const mongoose = require("mongoose");
const Article = new mongoose.Schema(
  {
    belongsToChapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChapterData",
    },
    articleName: { type: String },
    articleDesc: { type: String },
    articleUrl: { type: String },
    overallRating: { type: Number, default: 0 },
    overallQuality: { type: Number, default: 0 },
    overallComm: { type: Number, default: 0 },
    overallClarity: { type: Number, default: 0 },
    overallKnowledgeAndSkill: { type: Number, default: 0 },
    createdBy: { type: mongoose.Types.ObjectId, ref: "UserData" },
    ratings: [
      {
        userId: { type: mongoose.Types.ObjectId, ref: "UserData" },
        ratedOn: { type: Date, default: Date.now() },
        qualityRate: { type: Number },
        commRate: { type: Number },
        clarityRate: { type: Number },
        knowledgeAndSkillRate: { type: Number },
      },
    ],
    comments: [
      {
        addedBy: { type: mongoose.Types.ObjectId, ref: "UserData" },
        comment: { type: String },
        commentedOn: { type: String },
        replies: [
          {
            addedBy: { type: mongoose.Types.ObjectId, ref: "UserData" },
            reply: { type: String },
            repliedOn: { type: String },
          },
        ],
      },
    ],
    createdOn: { type: Date, default: Date.now },
  },
  {
    collection: "articles",
  }
);

const ArticleData =
  mongoose.models.ArticleData || mongoose.model("ArticleData", Article);
module.exports = ArticleData;
