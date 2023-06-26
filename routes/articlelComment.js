const express = require("express");
const articleCommentRoutes = express.Router();
const articleComment = require("../models/article.model");
const moment = require("moment");

articleCommentRoutes.route("/get-all-articles").get(function(req, res) {
  articleComment.find({}, (err, articles) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(articles);
    }
  });
});

articleCommentRoutes
  .route("/get-article-comments-by-article-id/:artiId")
  .get(function(req, res) {
    const { artiId } = req.params;
    articleComment
      .findById(artiId)
      .populate("comments.addedBy")
      .populate("comments.replies.addedBy")
      .exec((err, comment) => {
        if (err) {
          res.status(500).send(err);
        } else {
          const sortedComments = comment.comments.sort(
            (a, b) => new Date(b.commentedOn) - new Date(a.commentedOn)
          );

          sortedComments.forEach((comment) => {
            comment.replies.sort(
              (a, b) => new Date(b.repliedOn) - new Date(a.repliedOn)
            );
          });

          comment.comments = sortedComments;
          res.status(200).send(comment.comments);
        }
      });
  });

articleCommentRoutes.route("/create-article").post(async (req, res) => {
  const article = new articleComment(req.body);
  article
    .save()
    .then(() =>
      res.status(200).json({
        message: "Your request is successful",
      })
    )
    .catch((err) => {
      res
        .status(500)
        .json({ message: "Your request is unsuccessful", error: err });
    });
});

articleCommentRoutes
  .route("/add-article-comment/:artiId")
  .post(async (req, res) => {
    try {
      const artiId = req.params.artiId;
      const arti = await articleComment.findById(artiId);
      let newComment = {
        ...req.body,
        commentedOn: moment().format("YYYY-MM-DD hh:mm:ss.SS A"),
      };
      arti.comments.push(newComment);
      arti.save();

      res.status(200).json({
        message: "Your request is successful",
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Your request is unsuccessful", error: err });
    }
  });

articleCommentRoutes
  .route("/add-article-comment-replies/:artiId/:comId")
  .post(async (req, res) => {
    try {
      const { artiId, comId } = req.params;
      const arti = await articleComment.findById(artiId);
      const comment = arti.comments.id(comId);

      let newReply = {
        ...req.body,
        repliedOn: moment().format("YYYY-MM-DD hh:mm:ss.SS A"),
      };

      comment.replies.push(newReply);
      arti.save();

      res.status(200).json({
        message: "Your request is successful",
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Your request is unsuccessful", error: err });
    }
  });

module.exports = articleCommentRoutes;
