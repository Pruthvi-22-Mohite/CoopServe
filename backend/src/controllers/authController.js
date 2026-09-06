import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { inMemoryStore } from '../store/inMemoryStore.js';
import { DEMO_ACCOUNTS, ROLES } from '../config/constants.js';

const generateAccessToken = (user) => {
  const userId = user.id || (user._id ? user._id.toString() : '');
  return jwt.sign(
    { id: userId, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  const userId = user.id || (user._id ? user._id.toString() : '');
  return jwt.sign(
    { id: userId, tokenVersion: user.tokenVersion || 0 },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// Cookie management helper functions (zero additional npm dependencies)
export const getRefreshTokenFromReq = (req) => {
  if (req.cookies?.refreshToken) return req.cookies.refreshToken;
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)refreshToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = inMemoryStore.findUserByEmail(email);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User with this email does not exist.'
      });
    }

    // Explicit demo vs registered account verification
    if (user.isDemoAccount) {
      const isBcryptMatch = await bcrypt.compare(password, user.password).catch(() => false);
      const isDemoMatch = user.password === password || password === 'demo123' || password === 'password123' || isBcryptMatch;
      if (!isDemoMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password. For demo accounts use: password123'
        });
      }
    } else {
      // For all non-demo accounts, strictly compare using bcrypt
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Password does not match.'
        });
      }
    }

    const userObj = user.toObject ? user.toObject() : { ...user };
    if (!userObj.id && userObj._id) {
      userObj.id = userObj._id.toString();
    }

    const accessToken = generateAccessToken(userObj);
    const refreshToken = generateRefreshToken(userObj);
    setRefreshTokenCookie(res, refreshToken);

    const { password: _, ...userWithoutPassword } = userObj;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
      error: error.message
    });
  }
};

export const demoLogin = async (req, res) => {
  try {
    const { role } = req.params;
    let targetRole = role?.toUpperCase();

    if (targetRole === 'PROVIDER' || targetRole === 'WORKER') {
      targetRole = ROLES.SERVICE_PROVIDER;
    } else if (targetRole === 'USER' || targetRole === 'CLIENT') {
      targetRole = ROLES.CUSTOMER;
    }

    let demoUser = await User.findOne({ role: targetRole, isDemoAccount: true });
    if (!demoUser) {
      demoUser = inMemoryStore.users.find(u => u.role === targetRole);
    }

    if (!demoUser) {
      return res.status(404).json({
        success: false,
        message: `No demo account found for role: ${role}`
      });
    }

    const userObj = demoUser.toObject ? demoUser.toObject() : { ...demoUser };
    if (!userObj.id && userObj._id) {
      userObj.id = userObj._id.toString();
    }

    const accessToken = generateAccessToken(userObj);
    const refreshToken = generateRefreshToken(userObj);
    setRefreshTokenCookie(res, refreshToken);

    const { password: _, ...userWithoutPassword } = userObj;

    return res.status(200).json({
      success: true,
      message: `Switched to Demo ${demoUser.role} (${demoUser.name})`,
      token: accessToken,
      user: userWithoutPassword
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error executing demo login',
      error: error.message
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, location, skill } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser || inMemoryStore.findUserByEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // Admin accounts must be created via a separate seeded/protected mechanism, not public signup.
    // Public registration only ever allows CUSTOMER or SERVICE_PROVIDER, regardless of input role.
    const mappedRole = (role === 'SERVICE_PROVIDER' || role === 'PROVIDER')
      ? ROLES.SERVICE_PROVIDER
      : ROLES.CUSTOMER;

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: mappedRole,
      phone: phone || '+91 90000 00000',
      location: location || 'Pune, MH',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      isDemoAccount: false,
      tokenVersion: 0,
      ...(mappedRole === ROLES.SERVICE_PROVIDER && {
        skill: skill || 'General Services',
        trustScore: 85,
        rating: 5.0,
        reviewsCount: 0,
        jobsCompleted: 0,
        isVerified: false,
        isAvailable: true,
        coopMemberId: `COOP-MH-2026-${Math.floor(100 + Math.random() * 900)}`,
        startingPrice: 299
      }),
      ...(mappedRole === ROLES.CUSTOMER && {
        rewardsPoints: 100
      })
    };

    const newUser = await User.create(userData);
    const userObj = newUser.toObject();
    if (!userObj.id && userObj._id) {
      userObj.id = userObj._id.toString();
    }

    const accessToken = generateAccessToken(userObj);
    const refreshToken = generateRefreshToken(userObj);
    setRefreshTokenCookie(res, refreshToken);

    const { password: _, ...userWithoutPassword } = userObj;

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token: accessToken,
      user: userWithoutPassword
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error registering new account',
      error: error.message
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const rawRefreshToken = getRefreshTokenFromReq(req);

    if (!rawRefreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided in cookies.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(rawRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
        error: err.message
      });
    }

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
        message: 'User belonging to token no longer exists.'
      });
    }

    const userIdStr = user.id || user._id.toString();

    // Revocation and tokenVersion check
    if (
      decoded.tokenVersion === undefined ||
      decoded.tokenVersion !== user.tokenVersion ||
      inMemoryStore.isTokenRevoked(userIdStr, decoded.tokenVersion)
    ) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has been revoked or invalidated.'
      });
    }

    // Invalidate old token by incrementing tokenVersion & issue new rotated tokens
    inMemoryStore.revokeToken(userIdStr, decoded.tokenVersion);
    inMemoryStore.incrementTokenVersion(userIdStr);

    if (user.save) {
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      await user.save();
    }

    const userObj = user.toObject ? user.toObject() : { ...user };
    if (!userObj.id && userObj._id) {
      userObj.id = userObj._id.toString();
    }

    const newAccessToken = generateAccessToken(userObj);
    const newRefreshToken = generateRefreshToken(userObj);
    setRefreshTokenCookie(res, newRefreshToken);

    const { password: _, ...userWithoutPassword } = userObj;

    return res.status(200).json({
      success: true,
      token: newAccessToken,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during token refresh.',
      error: error.message
    });
  }
};

export const logout = async (req, res) => {
  try {
    const rawRefreshToken = getRefreshTokenFromReq(req);
    if (rawRefreshToken) {
      try {
        const decoded = jwt.verify(rawRefreshToken, process.env.JWT_REFRESH_SECRET);
        if (decoded?.id) {
          const isMongoId = mongoose.isValidObjectId(decoded.id);
          const filter = isMongoId
            ? { $or: [{ _id: decoded.id }, { id: decoded.id }] }
            : { id: decoded.id };
          await User.findOneAndUpdate(filter, { $inc: { tokenVersion: 1 } });
          inMemoryStore.incrementTokenVersion(decoded.id);
        }
      } catch {
        // Continue clearing cookie even if token was already expired
      }
    }

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout.',
      error: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const { password: _, ...userWithoutPassword } = req.user;
    return res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching current user profile',
      error: error.message
    });
  }
};

export const getDemoAccounts = async (req, res) => {
  return res.status(200).json({
    success: true,
    demoAccounts: DEMO_ACCOUNTS.map(({ password: _, ...acc }) => acc)
  });
};
