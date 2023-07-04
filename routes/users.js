const express = require("express");
const userRoutes = express.Router();
const User = require("../models/user.model");
const sendMail = require("../mail/mailer");
const auth = require("../middleware/checkPermission");
const ur = require("../userRoles/userRoles");

userRoutes.route("/users/showAllUsers/systemadmin/:depid").get(auth([ur.systemAdmin]), function (req, res) {
  console.log("Logged in user");
  console.log(req.loggedInUser);
  User.find({department:req.params.depid})
    .populate({ path: "department", select: "depName createdBy" })
    .exec((err, users) => {
      if (err) {
        res.send(err);
      } else {
        res.json(users);
      }
    });
});

userRoutes
  .route("/users/showAllUsers")
  .get(
    auth([ur.hiredEmployee, ur.contentCreator, ur.superAdmin]),
    function (req, res) {
      console.log("Logged in user");
      console.log(req.loggedInUser);
      User.find({})
        .populate({ path: "department", select: "depName createdBy" })
        .exec((err, users) => {
          if (err) {
            res.send(err);
          } else {
            res.json(users);
          }
        });
    }
  );

userRoutes.route("/users/getLoggedinUserData/:userID").get(function (req, res) {
  const userID = req.params.userID;
  User.find({ _id: userID })
    .populate({ path: "department", select: "depName createdBy Jobtitle" })
    .exec((err, users) => {
      if (err) {
        res.send(err);
      } else {
        const jobTitleID = users[0].jobPosition;
        let jobTitle;
        if (users[0].jobPosition) {
          jobTitle = (users[0]?.department?.Jobtitle).find((item) =>
            item?._id.equals(users[0]?.jobPosition)
          )?.jobTitlename;
        } else {
          jobTitle = null;
        }
        let userData = users.map((e) => {
          return {
            userID: e?._id,
            fname: e?.firstName,
            lname: e?.lastName,
            phone: e?.phoneNumber,
            email: e?.emailAddress,
            image: e?.userImage,
            userRole: e?.userRole,
            empId: e?.empId,
            dob: e?.dob,
            department: {
              departmentID: e?.department?._id,
              departmentName: e?.department?.depName,
            },
            jobTitle: {
              jobTitleID: jobTitleID,
              jobTitle: jobTitle,
            },
            submittedOn: e?.SubmittedOn,
            verified: e?.verified,
            acceptedChapters: e?.acceptedAdditionalChapter,
          };
        });
        res.json(userData);
      }
    });
});

userRoutes.route("/users/getAllUnverifiedUsers").get(function (req, res) {
  User.find({ verified: false })
    .populate({ path: "department", select: "depName createdBy Jobtitle" })
    .exec((err, users) => {
      if (err) {
        res.send(err);
      } else {
        let userData = users.map((e) => {
          return {
            userID: e._id,
            fname: e.firstName,
            lname: e.lastName,
            phone: e.phoneNumber,
            email: e.emailAddress,
            image: e.userImage,
            userRole: e.userRole,
            empId: e.empId,
            department: {
              departmentID: e.department._id,
              departmentName: e.department.depName,
            },
            jobTitle: {
              jobTitleID: e.jobPosition,
              jobTitle: e.department.Jobtitle.find((item) =>
                item._id.equals(e.jobPosition)
              ).jobTitlename,
            },
            submittedOn: e.SubmittedOn,
            verified: e.verified,
          };
        });
        res.json(userData);
      }
    });
});

userRoutes.route("/users/getAllUnverifiedUsersDepartment/:depID").get(function (req, res) {
  const depID = req.params.depID;
  User.find({ verified: false, department: depID})
    .populate({ path: "department", select: "depName createdBy Jobtitle" })
    .exec((err, users) => {
      if (err) {
        res.send(err);
      } else {
        let userData = users.map((e) => {
          return (
            {
              userID: e._id,
              fname: e.firstName,
              lname: e.lastName,
              phone: e.phoneNumber,
              email: e.emailAddress,
              image: e.userImage,
              userRole: e.userRole,
              empId: e.empId,
              department: {
                departmentID: e.department._id,
                departmentName: e.department.depName
              },
              jobTitle: {
                jobTitleID: e.jobPosition,
                jobTitle: (e.department.Jobtitle).find(item => item._id.equals(e.jobPosition)).jobTitlename
              },
              submittedOn: e.SubmittedOn,
              verified: e.verified
            }
          )
        })
        res.json(userData);
      }
    });
});

userRoutes.route("/users/isUserAvailable").post(async (req, res) => {
  const email = req.body.email;
  // const count = await User.estimatedDocumentCount({});
  User.findOne({ emailAddress: email }, (err, users) => {
    if (err) {
      res.send(err);
    } else {
      if (users) {
        console.log(users);
        if (users.verified === true) {
          res.json({ status: true });
        } else {
          res.json({
            name: users.firstName,
            status: "pending",
            message: `
              Your Account is not Approved by Supervisor yet. 
              In case of emergency, Please contact 0112347889. 
              You will be notified via email when your account get approval.
              Thank you ~ NETS Team
              `,
          });
        }
      } else {
        res.json({ status: false });
      }
    }
  });
});

userRoutes.route("/users/verifyuser").post(async (req, res) => {
  const result = req.body.result;
  const userID = req.body.userid;
  const email = req.body.email;
  if (result === "allow") {
    User.updateOne({ _id: userID }, { $set: { verified: true } })
      .then(async (result) => {
        const mailOptions = {
          to: email,
          subject: "NETS | Profile Verification",
          html: "Your Profile is verified successfully. You can Login to your NETS account",
        };
        const success = await sendMail(mailOptions);
        if (success) {
          console.log("Within if condition");
          return res.json({
            message: "User Verified Successfully. Mail Sent.",
            status: true,
          });
        } else {
          return res.json({
            message: "User Verified Successfully. Mail Sent failed.",
            status: true,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        return res.json({
          message: "Error in Verifying the User Role",
          status: false,
        });
      });
  } else if (result === "deny") {
    const deletedDocument = await User.findByIdAndDelete(userID);
    const mailOptions = {
      to: "ragurajsivanantham@gmail.com",
      subject: "NETS | Profile Verification",
      html: `<pre>
        Dear User,
        We regret to inform you that your profile has been denied due to the following reasons:
        
        1. Wrong Data: The information provided in your profile did not match our verification process.We request you to kindly update your profile with accurate information.
        2. Access to the System: It appears that you do not have the necessary permissions to access our system.Please contact our support team for further assistance.
      
        We understand that this may cause inconvenience to you, but we strive to maintain the highest standards of security and accuracy for our users.We encourage you to reapply with correct information or contact our support team if you have any questions or concerns.
        
        Thank you for your interest in our system.
        
        Best regards,
        NETS Team
      </pre > `,
    };
    const success = await sendMail(mailOptions);
    // console.log(success);
    if (success) {
      return res.json({
        message: "User Deleted Successfully. Mail Sent !",
        status: true,
        data: deletedDocument,
      });
    } else {
      return res.json({
        message: "User Deleted Successfully. Mail Sent Failed !",
        status: true,
        data: deletedDocument,
      });
    }
  } else {
    return res.json({
      message: "Unknown Status",
      status: false,
    });
  }
});

userRoutes.route("/users/isUserCollectionEmpty").get(async (req, res) => {
  try {
    const documents = await User.find().lean();
    const isEmpty = documents.length === 0;
    res.status(200).json({ status: isEmpty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = userRoutes;
