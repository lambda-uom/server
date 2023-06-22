const express = require("express");
const Unit = express.Router();
const UnitData = require("../models/unit.model");
const Chapter = require("../models/chapter.model");  //import the chapter model
// Unit.route('/').get(function(req, res) {
//   UnitData.find(function(err, units) {
//         if (err) {
//             console.log(err);
//         } else {
//             res.json(units);
//         }
//     });
// });

Unit.route("/").get(function (req, res) {
  const { chapterId } = req.query;

  // Filter the Units based on the chapterId
  const query = chapterId ? { belongsToChapter: chapterId } : {};

  UnitData.find(query, function (err, units) {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(units);
    }
  });
});

Unit.route("/:id").get(function (req, res) {
  let id = req.params.id;
  UnitData.findById(id, function (err, units) {
    res.json(units);
  });
});

Unit.route("/add").post(function (req, res) {
  let units = new UnitData(req.body);
  units
    .save()
    .then((u) => {
      console.log(u);
      Chapter.updateOne({ _id: units.belongsToChapter }, { $push: { unitsOffer: u._id } }, (err, data) => {
        if (err) {
          return res.status(400).send("adding new unit failed");
        }
        res.status(200).json({ units: "unit added successfully" });
      })
    })
    .catch((err) => {
      res.status(400).send("adding new unit failed");
    });
});

Unit.route("/update/:id").post(function (req, res) {
  UnitData.findById(req.params.id, function (err, units) {
    if (!units) {
      res.status(404).send("data is not found");
    } else {
      units.unitName = req.body.unitName;
      units.unitDesc = req.body.unitDesc;

      units
        .save()
        .then((units) => {
          res.status(200).json({ units: "unit updated successfully" });
        })
        .catch((err) => {
          res.status(400).send("Update not possible");
        });
    }
  });
});

Unit.route("/delete/:id").delete((req, res, next) => {
  UnitData.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        units: "unit deleted successfully",
      });
    }
  });
});

Unit.route("/quizentry/update/:id").post(function (req, res) {
  UnitData.findById(req.params.id, function (err, units) {
    if (!units) {
      res.status(404).send("data is not found");
    } else {
      units.quiz.quizName = req.body.quizName;
      units.quiz.quizDesc = req.body.quizDesc;
      units.quiz.timeLimit = req.body.timeLimit;

      units
        .save()
        .then((units) => {
          res.status(200).json({ units: "unit updated successfully" });
        })
        .catch((err) => {
          res.status(400).send("Update not possible");
        });
    }
  });
});

Unit.get("/units/quizentry/:id", async (req, res) => {
  try {
    const unit = await UnitData.findOne({ _id: req.params.id });
    res.json(unit.quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

Unit.post("/:id/quiz/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const unit = await UnitData.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    const newQuestion = {
      createdBy: userId,
      question: req.body.question,
      options: req.body.options,
      correctAnswer: req.body.correctAnswer,
    };

    unit.quiz.questions.push(newQuestion);

    const updatedUnit = await unit.save();

    res.json(updatedUnit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

Unit.delete("/:unitId/delete/:id", async (req, res) => {
  const { unitId, id } = req.params;

  try {
    const updatedTodo = await UnitData.findByIdAndUpdate(
      unitId,
      { $pull: { "quiz.questions": { _id: id } } },
      { new: true }
    );
    res.status(200).json(updatedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

Unit.put("/:id/update/:questionId", (req, res, next) => {
  const id = req.params.id;
  const questionId = req.params.questionId;
  UnitData.findById(id, (err, todo) => {
    if (err) {
      console.log(err);
    } else {
      const question = todo.quiz.questions.id(questionId);
      question.question = req.body.question;
      question.options = req.body.options;
      question.correctAnswer = req.body.correctAnswer;
      todo
        .save()
        .then((todo) => {
          res.status(200).json({ Questions: "Question updated successfully" });
        })
        .catch((err) => {
          res.status(400).send("Update not possible");
        });
    }
  });
});

module.exports = Unit;
