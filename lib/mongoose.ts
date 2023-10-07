import mongoose from "mongoose";

let isConnected = false;

const connectToDB = async () => {
  // Set strict query mode for Mongoose to prevent unknown field queries.
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) {
    console.log("MongoDB Url not found");
    isConnected = false;
    return;
  }
  if (isConnected) {
    console.log("MongoDB already connected");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "threadofy_app",
    });
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.log("[MONGODB_CONNECTION_ERROR]:", err);
    isConnected = false;
  }
};

export default connectToDB;
