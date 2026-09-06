import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { inMemoryStore } from '../store/inMemoryStore.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user = null;
    if (mongoose.isValidObjectId(decoded.id)) {
      user = await User.findOne({ $or: [{ _id: decoded.id }, { id: decoded.id }] });
    } else {
      user = await User.findOne({ id: decoded.id });
    }

    if (!user) {
      user = inMemoryStore.findUserById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or user not found.'
      });
    }

    const userObj = user.toObject ? user.toObject() : user;
    if (!userObj.id && userObj._id) {
      userObj.id = userObj._id.toString();
    }

    req.user = userObj;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.',
      error: err.message
    });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles only.`
      });
    }
    next();
  };
};
