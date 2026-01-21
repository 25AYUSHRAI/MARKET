const mongoose = require('mongoose');

async function connectDB() {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error('MONGO_URL environment variable is not configured');
    }

    await mongoose.connect(process.env.MONGO_URL, {
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("Connected to the database successfully");
  } catch(err) {
    console.error("Failed to connect to database:", err.message);
    // SECURITY: Exit process if database connection fails
    process.exit(1);
  }
}

module.exports = connectDB;