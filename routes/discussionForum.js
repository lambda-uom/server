const express = require("express");
const forumRoutes = express.Router();
const Forum = require("../models/discussionForum.model");
const moment = require("moment");

forumRoutes.route("/get-forums-by-chapter/:chptId").get(function (req, res) {
  const { chptId } = req.params;
  Forum.find({ belongsToChapter: chptId })
    .populate("createdBy")
    .sort({ createdOn: -1 })
    .exec((err, forums) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).json(forums);
      }
    });
});

forumRoutes
  .route("/get-forum-details-by-forum-id/:id")
  .get(function (req, res) {
    const { id } = req.params;
    Forum.findById(id)
      .populate("createdBy")
      .populate("posts.createdBy")
      .populate("posts.replies.createdBy")
      .exec((err, forum) => {
        if (err) {
          res.status(500).send(err);
        } else {
          const sortedPosts = forum.posts.sort(
            (a, b) => new Date(b.createdOn) - new Date(a.createdOn)
          );

          sortedPosts.forEach((post) => {
            post.replies.sort(
              (a, b) => new Date(b.createdOn) - new Date(a.createdOn)
            );
          });

          forum.posts = sortedPosts;
          res.status(200).send([forum]);
        }
      });
  });

forumRoutes
  .route("/get-post-details-by-post-id/:forumId/:postId")
  .get(async (req, res) => {
    try {
      const { forumId, postId } = req.params;

      const forum = await Forum.findById(forumId);
      if (!forum) {
        return res.status(500).send(err);
      }

      const post = forum.posts.id(postId);
      if (!post) {
        return res.status(500).send(err);
      }
      res.status(200).send([post]);
    } catch (err) {
      res.status(500).send(err);
    }
  });

forumRoutes
  .route("/get-reply-details-by-reply-id/:forumId/:postId/:replyId")
  .get(async (req, res) => {
    try {
      const { forumId, postId, replyId } = req.params;

      const forum = await Forum.findById(forumId);
      if (!forum) {
        return res.status(500).send(err);
      }

      const post = forum.posts.id(postId);
      if (!post) {
        return res.status(500).send(err);
      }

      const reply = post.replies.id(replyId);
      if (!reply) {
        return res.status(500).send(err);
      }
      res.status(200).send([reply]);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });

forumRoutes.route("/edit-forum/:id").put(function (req, res) {
  const { id } = req.params;
  Forum.findByIdAndUpdate(id, req.body, (err, forums) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json({
        message: "Your request is successful",
      });
    }
  });
});

forumRoutes.route("/create-forum").post(async (req, res) => {
  const forum = new Forum(req.body);

  forum
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

forumRoutes.route("/add-posts/:forumId").post(async (req, res) => {
  try {
    const forumId = req.params.forumId;
    const forum = await Forum.findById(forumId);

    let newPost = {
      ...req.body,
      createdOn: moment().format("YYYY-MM-DD hh:mm:ss.SS A"),
    };

    forum.posts.push(newPost);
    forum.save();

    res.status(200).json({
      message: "Your request is successful",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Your request is unsuccessful", error: err });
  }
});

forumRoutes.route("/add-replies/:forumId/:postId").post(async (req, res) => {
  try {
    const { forumId, postId } = req.params;
    const forum = await Forum.findById(forumId);
    const post = forum.posts.id(postId);

    let newReply = {
      ...req.body,
      createdOn: moment().format("YYYY-MM-DD hh:mm:ss.SS A"),
    };

    post.replies.push(newReply);
    forum.save();

    res.status(200).json({
      message: "Your request is successful",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Your request is unsuccessful", error: err });
  }
});

module.exports = forumRoutes;
