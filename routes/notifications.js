const express = require("express");
const notificationRoute = express.Router();
// const Notification = require('../models/Notification.model');
const Users = require("../models/user.model");

notificationRoute.route("/notifications/:id").get(function (req, res) {
    try {
        const userID = req.params.id;
        Users.findById(userID)
            .select('notifications')
            .exec((err, data) => {
                if (err) {
                    console.error('Error retrieving user:', err);
                    return res.send("Error");
                } else {
                    const newData = {
                        "_id":data._id,
                        "notifications":data.notifications.reverse()
                    }
                    return res.json(newData)
                }
            });
    } catch (err) {
        return res.json([{ message: "Error" }]);
        console.log(err);
    }
});

notificationRoute.route("/notification/seen").post(async function (req, res) {
    try {
        const userID = req.body.userID
        const notificationID = req.body.notificationID
        const users = await Users.findById(userID);
        const currentNotification = users.notifications.find((notification) => notification._id == notificationID)
        if (currentNotification) {
            currentNotification.seen = true;
            users.save();
            return res.json({ "status": true, message: "OK" });
        }
    } catch (err) {
        return res.json([{ message: "Error" }]);
        console.log(err);
    }
});

module.exports = notificationRoute;