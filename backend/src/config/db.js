import mongoose from 'mongoose';
import User from '../models/User.js';
import { DEMO_ACCOUNTS } from './constants.js';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error('MongoDB connection failed: MONGODB_URI environment variable is not defined.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);

    // Seed demo accounts if not already present in MongoDB
    try {
      for (const acc of DEMO_ACCOUNTS) {
        const exists = await User.findOne({ $or: [{ id: acc.id }, { email: acc.email }] });
        if (!exists) {
          await User.create({ ...acc, tokenVersion: 0, isDemoAccount: true });
        }
      }
    } catch (seedErr) {
      console.warn('[MongoDB] Demo accounts seed note:', seedErr.message);
    }

    return conn;
  } catch (error) {
    // Sanitize any credentials from error messages before logging
    const safeError = (error.message || '').replace(/\/\/[^@]+@/, '//***:***@');
    console.error(`MongoDB connection failed: ${safeError}`);
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from database.');
});

mongoose.connection.on('error', (err) => {
  const safeError = (err.message || '').replace(/\/\/[^@]+@/, '//***:***@');
  console.error(`[MongoDB] Runtime error: ${safeError}`);
});
