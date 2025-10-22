const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for the token in the 'Authorization' header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (it's formatted as "Bearer <token>")
      token = req.headers.authorization.split(" ")[1];

      // Verify the token's signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user from the ID in the token and attach them to the 'req' object
      // We exclude the password
      req.user = await User.findById(decoded.id).select("-password");

      next(); // User is valid, proceed to the route
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
