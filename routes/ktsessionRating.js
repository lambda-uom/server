const express = require("express");
const KtSession = express.Router();

const KtSessions = require("../models/ktSession.model");
const Users = require("../models/user.model");

KtSession.get("/ktsessionRatings/:empId", async (req, res) => {
  try {
    let reqEmpId = req.params.empId;
    let [user] = await Users.find({ empId: reqEmpId });
    // if user is not found
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found in the KT session section" });
    }
    //add user details
    const userData = {
      empId: user?.empId,
      userImage: user?.userImage,
      empName: user?.firstName + " " + user?.lastName,
    };
    let ktSessionRatings = await KtSessions.find({
      createdBy: user?._id,
      overallRating: { $gt: 0 },
    });
    let ktSessionRatingsData = {};
    let sessionData = [];

    if (ktSessionRatings?.length > 0) {
      // data for overall ratings
      let overAllRating = 0;
      let overAllQuality = 0;
      let overAllComm = 0;
      let overAllClarity = 0;
      let overAllKnowledgeAndSkill = 0;

      //data to progress bar
      let overAllQualityData = [];
      let overAllCommData = [];
      let overAllClarityData = [];
      let overAllKnowledgeAndSkillData = [];

      for (let ratings of ktSessionRatings) {
        let session = {
          sessionName: ratings?.sessionName,
          overallRating: ratings?.overallRating,
        };
        sessionData.push(session);
        //data to progress bar
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
        // count  the stars individually like 1 stars,2 stars,3 stars,4 stars,5 stars
        overAllRatingData.map((data) =>
          data === 1
            ? count1++
            : data === 2
            ? count2++
            : data === 3
            ? count3++
            : data === 4
            ? count4++
            : data === 5 && count5++
        );
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

      //call individualRates to count  the stars individually like 1 stars,2 stars,3 stars,4 stars,5 stars
      overAllQualityData = individualRates(overAllQualityData);
      overAllCommData = individualRates(overAllCommData);
      overAllClarityData = individualRates(overAllClarityData);
      overAllKnowledgeAndSkillData = individualRates(
        overAllKnowledgeAndSkillData
      );

      //rating
      let finalOverAllRating = (
        overAllRating / ktSessionRatings?.length
      ).toFixed(1);
      let finalOverAllQuality = (
        overAllQuality / ktSessionRatings?.length
      ).toFixed(1);
      let finalOverAllComm = (overAllComm / ktSessionRatings?.length).toFixed(
        1
      );
      let finalOverAllClarity = (
        overAllClarity / ktSessionRatings?.length
      ).toFixed(1);
      let finalOverAllKnowledgeAndSkill = (
        overAllKnowledgeAndSkill / ktSessionRatings?.length
      ).toFixed(1);

      //data for progress bar
      let ratingData = [
        overAllQualityData,
        overAllCommData,
        overAllClarityData,
        overAllKnowledgeAndSkillData,
      ];
      if (finalOverAllRating > 0) {
        ktSessionRatingsData = {
          sessionData,
          userData,
          finalOverAllRating,
          finalOverAllQuality,
          finalOverAllComm,
          finalOverAllClarity,
          finalOverAllKnowledgeAndSkill,
          numOfKtSessions: ktSessionRatings?.length,
          ratingData,
        };
      }
    }
    res.json(ktSessionRatingsData);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

KtSession.get("/get-kt-ratings/:ktId", async (req, res) => {
  const ktId = req.params.ktId;
  KtSessions.findById(ktId, (err, kt) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(kt.overallRating);
    }
  });
});

KtSession.get("/get-user-rated-kt/:ktId/:userId", async (req, res) => {
  try {
    const { ktId, userId } = req.params;

    const kt = await KtSessions.findOne({
      _id: ktId,
      "ratings.userId": userId,
    });

    if (kt) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

KtSession.route("/save-kt-ratings/:ktId").post(async (req, res) => {
  try {
    const ktId = req.params.ktId;
    console.log(ktId);
    const session = await KtSessions.findById(ktId);
    console.log(session);

    session.ratings.push(req.body);
    session.save();

    const newKT = await KtSessions.findById(ktId).lean();
    let qualityRateSum = 0;
    let commRateSum = 0;
    let clarityRateSum = 0;
    let knowledgeAndSkillRateSum = 0;

    let overallQualityRate = 0;
    let overallCommRate = 0;
    let overallClarityRate = 0;
    let overallKnowledgeAndSkillRate = 0;
    let overallRate = 0;

    let ratingCount = newKT.ratings.length;

    console.log(newKT);

    newKT.ratings.forEach((rating) => {
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

    const updateKT = await KtSessions.findByIdAndUpdate(ktId, {
      overallRating: overallRate,
      overallQuality: overallQualityRate,
      overallComm: overallCommRate,
      overallClarity: overallClarityRate,
      overallKnowledgeAndSkill: overallKnowledgeAndSkillRate,
    });

    console.log(updateKT);

    res.status(200).json({
      message: "Your request is successful",
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = KtSession;
