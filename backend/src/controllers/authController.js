import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { inMemoryStore } from '../store/inMemoryStore.js';
import { DEMO_ACCOUNTS, ROLES, SUPPORTED_LOCATIONS } from '../config/constants.js';

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
    const {
      name,
      email,
      password,
      role,
      phone,
      state,
      city,
      neighbourhood,
      location,
      skill,
      customSkill,
      lat,
      lng,
      trustedContact
    } = req.body;

    // 1. Mandatory Field Presence Validation
    const missingFields = [];
    if (!name || !name.trim()) missingFields.push('name');
    if (!email || !email.trim()) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!phone || !phone.trim()) missingFields.push('phone');
    if (!role || !role.trim()) missingFields.push('role');

    const isProvider = (role === 'SERVICE_PROVIDER' || role === 'PROVIDER');
    if (isProvider && (!skill || !skill.trim())) {
      missingFields.push('skill');
    }
    if (isProvider && skill === 'Other' && (!customSkill || !customSkill.trim())) {
      missingFields.push('customSkill');
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(', ')}`
      });
    }

    // 2. Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format.'
      });
    }

    // 3. Indian Mobile Number Validation (+91 or 91 optional, 10 digits starting 6-9)
    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Indian mobile number. Must be 10 digits starting with 6-9 (optional +91).'
      });
    }

    // 4. Password Strength Validation (min 8 chars, at least 1 letter and 1 number)
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one letter and one number.'
      });
    }

    // 5. Existing User Check
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser || inMemoryStore.findUserByEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // Admin accounts must be created via a separate seeded/protected mechanism, not public signup.
    const mappedRole = isProvider ? ROLES.SERVICE_PROVIDER : ROLES.CUSTOMER;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Compute formatted location string
    const stateVal = state || 'Maharashtra';
    const cityVal = city || 'Pune';
    const neighbourhoodVal = neighbourhood ? neighbourhood.trim() : '';
    const computedLocation = neighbourhoodVal
      ? `${neighbourhoodVal}, ${cityVal}, ${stateVal}`
      : (location || `${cityVal}, ${stateVal}`);

    const effectiveSkill = skill === 'Other' && customSkill ? customSkill.trim() : (skill || 'General Services');

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: mappedRole,
      phone: cleanPhone,
      state: stateVal,
      city: cityVal,
      neighbourhood: neighbourhoodVal,
      location: computedLocation,
      lat: typeof lat === 'number' ? lat : (lat ? parseFloat(lat) : null),
      lng: typeof lng === 'number' ? lng : (lng ? parseFloat(lng) : null),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
      isDemoAccount: false,
      tokenVersion: 0,
      trustedContact: {
        name: trustedContact?.name ? trustedContact.name.trim() : '',
        phone: trustedContact?.phone ? trustedContact.phone.trim() : ''
      },
      ...(mappedRole === ROLES.SERVICE_PROVIDER && {
        skill: effectiveSkill,
        customSkill: customSkill ? customSkill.trim() : '',
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
    console.error('Registration error:', error);
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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address.'
      });
    }

    // Generate short-lived reset token (15 min expiry)
    const resetToken = jwt.sign(
      { id: user.id || user._id.toString(), email: user.email, type: 'pwd_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

    // Development shortcut: Log password reset link to server console
    console.log('\n======================================================');
    console.log(`🔑 [CoopServe Auth] Password Reset Link for ${user.email}:`);
    console.log(`👉 ${resetLink}`);
    console.log('======================================================\n');

    return res.status(200).json({
      success: true,
      message: 'Password reset instructions generated.',
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
      resetLink: process.env.NODE_ENV !== 'production' ? resetLink : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing forgot password request.',
      error: error.message
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is required.'
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required.'
      });
    }

    // Password strength check: min 8 chars, 1 letter, 1 number
    if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain at least one letter and one number.'
      });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.'
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.'
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate all active sessions
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error resetting password.',
      error: error.message
    });
  }
};

export const getLocations = (req, res) => {
  return res.status(200).json({
    success: true,
    locations: SUPPORTED_LOCATIONS
  });
};
