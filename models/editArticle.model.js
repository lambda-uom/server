const mongoose = require("mongoose");

const EditArticle = new mongoose.Schema(
  {
    chapterName: {
      type: String,
      required: true,
    },
    articleId: { type: mongoose.Types.ObjectId, ref: "ArticleData" },
    articleName: {
      type: String,
      required: true,
    },
    articleDesc: {
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
      articleName: String,
      articleDesc: String,
    },
    updatedby: { type: mongoose.Types.ObjectId, ref: "UserData" },
  },
  {
    collection: "editarticles",
  }
);

const model = mongoose.model("EditArticleData", EditArticle);
module.exports = model;
