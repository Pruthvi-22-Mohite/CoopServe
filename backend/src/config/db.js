import mongoose from 'mongoose';

export const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.log(`[CoopServe Storage] Initialized In-Memory & Demo Data Repository.`);
    return false;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.log(`[MongoDB] Connection skipped (${error.message}). Using In-Memory Store.`);
    return false;
  }
};
