const express = require("express");
const Article = express.Router();

const Articles = require("../models/article.model");
const Users = require("../models/user.model");

Article.get("/articleRatings/:empId", async (req, res) => {
  try {
    let reqEmpId = req.params.empId;
    let [user] = await Users.find({ empId: reqEmpId });
    // if user not found
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found in the article section" });
    }
    //add user details
    const userData = {
      empId: user?.empId,
      userImage: user?.userImage,
      empName: user?.firstName + " " + user?.lastName,
    };
    //find articles of requested user
    let articleRatings = await Articles.find({ createdBy: user?._id });
    let articleRatingsData = {};
    let artRatings = [];

    // if the required employee written article, continue
    if (articleRatings.length > 0) {
      let overAllRating = 0;
      let overAllQuality = 0;
      let overAllComm = 0;
      let overAllClarity = 0;
      let overAllKnowledgeAndSkill = 0;

      //initializing data to progress bar
      let overAllRatingData = [];
      let overAllQualityData = [];
      let overAllCommData = [];
      let overAllClarityData = [];
      let overAllKnowledgeAndSkillData = [];

      for (let ratings of articleRatings) {
        let article = {
          articleName: ratings?.articleName,
          overallRating: ratings?.overallRating,
        };
        artRatings.push(article);
        //data to progress bar
        overAllRatingData.push(ratings?.overallRating);
        overAllQualityData.push(ratings?.overallQuality);
        overAllCommData.push(ratings?.overallComm);
        overAllClarityData.push(ratings?.overallClarity);
        overAllKnowledgeAndSkillData.push(ratings?.overallKnowledgeAndSkill);

        //storing overAllRating
        overAllRating += ratings?.overallRating;
        overAllQuality += ratings?.overallQuality;
        overAllComm += ratings?.overallComm;
        overAllClarity += ratings?.overallClarity;
        overAllKnowledgeAndSkill += ratings?.overallKnowledgeAndSkill;
      }

      //progressbar data calculation
      const individualRates = (overAllRatingData) => {
        let count1 = 0;
        let count2 = 0;
        let count3 = 0;
        let count4 = 0;
        let count5 = 0;
        //counting how many 1 stars,2 stars,3 stars,4 stars,5 stars
        overAllRatingData.map((data) =>
          data === 1
            ? count1++
            : data === 2
            ? count2++
            : data === 3
            ? count3++
            : data === 4
            ? count4++
            : count5++
        );
        //sum of stars
        let totalCount = count1 + count2 + count3 + count4 + count5;

        overAllRatingData = [
          parseFloat(((count1 / totalCount) * 100).toFixed(2)),
          parseFloat(((count2 / totalCount) * 100).toFixed(2)),
          parseFloat(((count3 / totalCount) * 100).toFixed(2)),
          parseFloat(((count4 / totalCount) * 100).toFixed(2)),
          parseFloat(((count5 / totalCount) * 100).toFixed(2)),
        ];

        return overAllRatingData;
      };

      //data for progress bar
      overAllRatingData = individualRates(overAllRatingData);
      overAllQualityData = individualRates(overAllQualityData);
      overAllCommData = individualRates(overAllCommData);
      overAllClarityData = individualRates(overAllClarityData);
      overAllKnowledgeAndSkillData = individualRates(
        overAllKnowledgeAndSkillData
      );

      //rating
      let finalOverAllRating = (overAllRating / articleRatings.length).toFixed(
        1
      );
      let finalOverAllQuality = (
        overAllQuality / articleRatings.length
      ).toFixed(1);
      let finalOverAllComm = (overAllComm / articleRatings.length).toFixed(1);
      let finalOverAllClarity = (
        overAllClarity / articleRatings.length
      ).toFixed(1);
      let finalOverAllKnowledgeAndSkill = (
        overAllKnowledgeAndSkill / articleRatings.length
      ).toFixed(1);

      //data for progress bar
      let ratingData = [
        overAllQualityData,
        overAllCommData,
        overAllClarityData,
        overAllKnowledgeAndSkillData,
      ];
      if (finalOverAllRating > 0) {
        articleRatingsData = {
          artRatings,
          userData,
          finalOverAllRating,
          finalOverAllQuality,
          finalOverAllComm,
          finalOverAllClarity,
          finalOverAllKnowledgeAndSkill,
          numOfArticles: articleRatings.length,
          overAllRatingData,
          ratingData,
        };
      }
    }
    res.json(articleRatingsData);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

Article.get("/get-article-ratings/:articleId", async (req, res) => {
  const articleId = req.params.articleId;
  Articles.findById(articleId, (err, arti) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(arti.overallRating);
    }
  });
});

Article.get("/get-user-rated-article/:articleId/:userId", async (req, res) => {
  try {
    const { articleId, userId } = req.params;

    const article = await Articles.findOne({
      _id: articleId,
      "ratings.userId": userId,
    });

    if (article) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

Article.route("/save-article-ratings/:articleId").post(async (req, res) => {
  try {
    const articleId = req.params.articleId;
    console.log(articleId);
    const article = await Articles.findById(articleId);
    console.log(article);

    article.ratings.push(req.body);
    article.save();

    const newArticle = await Articles.findById(articleId).lean();
    let qualityRateSum = 0;
    let commRateSum = 0;
    let clarityRateSum = 0;
    let knowledgeAndSkillRateSum = 0;

    let overallQualityRate = 0;
    let overallCommRate = 0;
    let overallClarityRate = 0;
    let overallKnowledgeAndSkillRate = 0;
    let overallRate = 0;

    let ratingCount = newArticle.ratings.length;

    console.log(newArticle);

    newArticle.ratings.forEach((rating) => {
      qualityRateSum += rating.qualityRate;
      commRateSum += rating.commRate;
      clarityRateSum += rating.clarityRate;
      knowledgeAndSkillRateSum += rating.knowledgeAndSkillRate;
    });

    console.log(qualityRateSum);

    overallQualityRate = Math.floor(qualityRateSum / ratingCount);
    overallCommRate = Math.floor(commRateSum / ratingCount);
    overallClarityRate = Math.floor(clarityRateSum / ratingCount);
    overallKnowledgeAndSkillRate = Math.floor(
      knowledgeAndSkillRateSum / ratingCount
    );

    console.log(overallKnowledgeAndSkillRate);

    overallRate = Math.floor(
      (qualityRateSum +
        commRateSum +
        clarityRateSum +
        knowledgeAndSkillRateSum) /
        (ratingCount * 4)
    );

    console.log(overallRate);

    const updateArticle = await Articles.findByIdAndUpdate(articleId, {
      overallRating: overallRate,
      overallQuality: overallQualityRate,
      overallComm: overallCommRate,
      overallClarity: overallClarityRate,
      overallKnowledgeAndSkill: overallKnowledgeAndSkillRate,
    });

    console.log(updateArticle);

    res.status(200).json({
      message: "Your request is successful",
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = Article;
