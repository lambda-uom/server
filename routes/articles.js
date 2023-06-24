const express = require("express");
const Article = express.Router();
const ArticleData = require("../models/article.model");

// Article.route('/').get(function(req, res) {
//     ArticleData.find(function(err, articles) {
//         if (err) {
//             console.log(err);
//         } else {
//             res.json(articles);
//         }
//     });
// });

Article.route("/").get(function(req, res) {
  const { chapterId } = req.query;
  // Filter the Articles based on the chapterId
  const query = chapterId ? { belongsToChapter: chapterId } : {};
  ArticleData.find(query, function(err, articles) {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(articles);
    }
  });
});

Article.route("/:id").get(function(req, res) {
  let id = req.params.id;
  ArticleData.findById(id, function(err, articles) {
    res.json([articles]);
  });
});

Article.route("/add").post(function(req, res) {
  let articles = new ArticleData(req.body);
  articles
    .save()
    .then((articles) => {
      res.status(200).json({ article: "Article added successfully" });
    })
    .catch((err) => {
      res.status(400).send("adding new Article failed");
    });
});

Article.route("/update/:id").post(function(req, res) {
  ArticleData.findById(req.params.id, function(err, articles) {
    if (!articles) res.status(404).send("data is not found");
    else articles.articleName = req.body.articleName;
    articles.articleDesc = req.body.articleDesc;
    articles.articleUrl = req.body.articleUrl;

    articles
      .save()
      .then((articles) => {
        res.status(200).json({ article: "Article updated successfully" });
      })
      .catch((err) => {
        res.status(400).send("Update not possible");
      });
  });
});

Article.route("/delete/:id").delete((req, res, next) => {
  ArticleData.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data,
      });
    }
  });
});

Article.route("/delete/:id").delete((req, res, next) => {
  ArticleData.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data,
      });
    }
  });
});

module.exports = Article;
