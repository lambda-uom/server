const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const fs = require("fs");
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: "GET,POST,PUT,DELETE,OPTIONS",
  })
);
app.use(express.urlencoded({ extended: true })); // if we want to test with postman x-www-form-urlencoded
app.use(express.json());
app.use(express.static("public")); // store files in server
//route imports
app.use(require("./routes/authentication"));
app.use(require("./routes/users"));
app.use(require("./routes/sample"));
app.use(require("./routes/userroles"));
app.use(require("./routes/departments"));
app.use(require("./routes/jobtitles"));
app.use(require("./routes/chapters"));
app.use(require("./routes/commonChapters"));
app.use(require("./routes/chapterReport"));
app.use(require("./routes/overviewReport"));
app.use(require("./routes/quizResult"));
app.use(require("./routes/quizReview"));
app.use(require("./routes/ktsessionRating"));
app.use(require("./routes/articleRating"));
app.use(require("./routes/leaderboard"));
app.use(require("./routes/submissionTable"));
app.use(require("./routes/evaluateSubmission"));
app.use(require("./routes/general"));
app.use(require("./routes/guidanceTicket"));
app.use(require("./routes/discussionForum"));
app.use(require("./routes/ktSessionComment"));
app.use(require("./routes/articlelComment"));
app.use(require("./routes/report"));
app.use(require("./routes/downloadSubmission"));
app.use(require("./routes/scoreEditLog"));
app.use(require("./routes/finalProjectAssignment"));
app.use(require("./routes/badges"));
app.use(require("./routes/quizFront"));
app.use(require("./routes/quizReport"));
app.use(require("./routes/notifications"));
app.use(require("./routes/feedback"));
app.use(require("./routes/projectScore"));

app.use("/units", require("./routes/units"));
app.use("/kts", require("./routes/ktsessions"));
app.use("/arts", require("./routes/articles"));
app.use("/submissions", require("./routes/quizAnswers"));
app.use("/editunits", require("./routes/editunits"));
app.use("/editkts", require("./routes/editkts"));
app.use("/editarticles", require("./routes/editarticles"));
app.use("/editForums", require("./routes/editForums"));
app.use("/editquestions", require("./routes/editquestions"));


app.use("/deleteunits", require("./routes/deleteunits"));
app.use("/deletekts", require("./routes/deletekts"));
app.use("/deletearticles", require("./routes/deletearticles"));
app.use("/deletequestions", require("./routes/deletequestions"));

mongoose.set("strictQuery", false);
// format

// mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database>?retryWrites=true&w=majority
// const connUrl = "mongodb://127.0.0.1:27017/nets";
// const connUrl = "mongodb://localhost:27017/NETS";
// "mongodb+srv://admin:o2rRfSYGKkUCHG8s@cluster0.eh378xa.mongodb.net/netsTest?retryWrites=true&w=majority";

mongoose
  .connect(process.env.MONGO_LOCAL_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    autoIndex: true, //make this also true
  })
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  return res.json({
    message: "Access to this page is not allowed",
    active: false,
  });
});


app.get("/file/:filename", (req, res) => {
  const filename = req.params.filename;
  if(! filename){
    return res.status(200).send("Please provide a filename");
  }
  // Replace with the actual file path
  const filePath = path.join(__dirname, `/uploads/finalAssignmentSubmissions/${filename}`);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Failed to delete the file.");
    } else {
      res.send("File deleted successfully.");
    }
  });
});

app.listen(1337, () => {
  ``;
  console.log("Node Server running on  port 1337");
});
