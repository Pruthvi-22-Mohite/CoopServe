import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Provider from '../models/Provider.js';
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
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles only.`
      });
    }

    const userRole = req.user.role;
    const isAllowed = userRole && (
      allowedRoles.includes(userRole) ||
      allowedRoles.some(r => String(r).toUpperCase() === String(userRole).toUpperCase())
    );

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}] roles only.`
      });
    }
    next();
  };
};

/**
 * Checks whether an authenticated user is authorized for a specific booking.
 * Allowed:
 *  - Customer belonging to booking
 *  - Provider assigned to booking
 *  - Authorized Admin
 * Denied:
 *  - Unrelated users
 */
export const isUserAuthorizedForBooking = async (user, booking) => {
  if (!user || !booking) return false;

  const userRole = (user.role || '').toUpperCase();
  if (userRole === 'ADMIN') {
    return true;
  }

  const userIdStr = user.id ? String(user.id) : (user._id ? String(user._id) : '');
  const userObjIdStr = user._id ? String(user._id) : '';

  // 1. Customer check
  const bookingCustId = booking.customerId ? String(booking.customerId) : '';
  if (userIdStr && bookingCustId && (userIdStr === bookingCustId || userObjIdStr === bookingCustId)) {
    return true;
  }

  // 2. Provider direct check
  const bookingProvId = booking.providerId ? String(booking.providerId) : '';
  if (userIdStr && bookingProvId && (userIdStr === bookingProvId || userObjIdStr === bookingProvId)) {
    return true;
  }

  // 3. Provider document lookup in MongoDB
  if (userRole === 'SERVICE_PROVIDER' || userRole === 'PROVIDER') {
    try {
      const providerDoc = await Provider.findOne({
        $or: [
          { userId: userIdStr },
          { id: userIdStr },
          ...(mongoose.isValidObjectId(userIdStr) ? [{ _id: userIdStr }] : []),
          ...(userObjIdStr && mongoose.isValidObjectId(userObjIdStr) ? [{ _id: userObjIdStr }] : [])
        ]
      });

      if (providerDoc) {
        const pDocId = providerDoc.id ? String(providerDoc.id) : '';
        const pDocMongoId = providerDoc._id ? String(providerDoc._id) : '';
        const pDocUserId = providerDoc.userId ? String(providerDoc.userId) : '';
        if (
          (pDocId && bookingProvId === pDocId) ||
          (pDocMongoId && bookingProvId === pDocMongoId) ||
          (pDocUserId && bookingProvId === pDocUserId)
        ) {
          return true;
        }
      }
    } catch (err) {
      console.warn('[Authorization Check Error]', err.message);
    }

    // Support demo provider account mapping (usr_provider_demo <-> prov_1)
    if (userIdStr === 'usr_provider_demo' && (bookingProvId === 'prov_1' || bookingProvId === 'usr_provider_demo')) {
      return true;
    }
  }

  return false;
};

export const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
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
      return next();
    }

    const userObj = user.toObject ? user.toObject() : user;
    if (!userObj.id && userObj._id) {
      userObj.id = userObj._id.toString();
    }

    req.user = userObj;
    return next();
  } catch (err) {
    return next();
  }
};

