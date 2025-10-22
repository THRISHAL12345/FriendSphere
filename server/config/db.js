// This file handles the connection logic to our MongoDB database.

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // We use the MONGO_URI from our .env file to connect.
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Exit the process with failure if we can't connect to the database.
    process.exit(1);
  }
};

module.exports = connectDB;
