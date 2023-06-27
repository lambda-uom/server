const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = (userRoles) => {
  return (req, res, next) => {
    const token = req.header("token");
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized', status: false });
    } else {
      jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
        if (err) {
          // return when 
          return res.status(401).json({ message: "Unauthorized 2", status: false });
        } else {
          // decoded loggedin user data will be available inside the decoded object
          // the user roles that can access next end point list is available in userRoles array
          // if decoded.userData.userRole is available inside the userRoles array, 
          if (userRoles.includes(decoded.userData.userRole)) {
            // in next end point we can access this loggedInUser data
            req.loggedInUser = decoded.userData;
            next()
          }
        }
      });
    }
  }
};

module.exports = auth;
