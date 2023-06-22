const express = require('express');
const router = express.Router();
const moment = require('moment');
const QuizSubmissionData = require('../models/quizSubmission.model');
const UserData = require("../models/user.model"); // Import the User model
const UnitData = require("../models/unit.model");

var nodemailer = require('nodemailer');

router.route('/').get(function(req, res) {
  QuizSubmissionData.find(function(err, todo) {
      if (err) {
          console.log(err);
      } else {
          res.json(todo);
      }
  });
});

 

router.get('/find/:id/:userid', async (req, res) => {
  const { id, userid } = req.params;

  try {
    const submission = await QuizSubmissionData.findOne({ unitId: id, userId: userid });

    if (submission) {
      res.status(200).json(submission); // Return the submission if found
    } else {
      res.status(404).json({ error: 'Submission not found' }); // Return an error if not found
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' }); // Return a generic error message for server errors
  }
});

router.post('/:unitId/:userId/:chapterid/:depid', (req, res) => {
  const { unitId, userId, chapterid, depid } = req.params;
  const { questions, attemptedTime } = req.body;

  const updated_at = moment().format('YYYY-MM-DD hh:mm:ss A');

  const newSubmission = new QuizSubmissionData({
    quizBelongsToDepartmet: depid,
    chapterId: chapterid,
    unitId: unitId,
    userId: userId,
    questions: questions,
    attemptedTime: attemptedTime,
    submittedTime: updated_at,
  });

  newSubmission.save((err, quizsubmission) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error saving quiz submission to database');
    }
    console.log('Quiz submission saved:', quizsubmission);

    // Retrieve the user document for the user who submitted the quiz
    UserData.findById(userId, (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error retrieving user data');
      }

      // Retrieve the unit document for the submitted unit ID
      UnitData.findById(unitId, (err, unit) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error retrieving unit data');
        }

        // Get the current time (hour and minutes)
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Add the notification sentence to the user's notification array
        const notificationSentence = `${user.firstName} ${user.lastName} submitted the quiz in unit ${unit.unitName} at ${currentTime}`;

        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'nets.lambdauom@gmail.com',
            pass: 'gnvhxwsbjqvnxprk'
          }
        });
        
        var mailOptions = {
          from: 'nets.lambdauom@gmail.com',
          to: 'malikananayakkara69@gmail.com',
          subject: 'Quiz Submissions',
          text: notificationSentence
        };
         
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
         
        return res.status(200).send('Quiz submission saved to database');
      });
    });
  });
});


module.exports = router;
