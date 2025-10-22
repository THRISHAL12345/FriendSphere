const jwt = require("jsonwebtoken");

// This function takes a user's ID, signs it with our secret key
// from the .env file, and creates a token that expires in 30 days.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
