const mongoose = require("mongoose");

const connectDB = async () => {
  const MONGO_URI =
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/library-management-system";

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.warn(
      "Continuing without MongoDB. The frontend can still be served.",
    );
  }
};

module.exports = connectDB;
