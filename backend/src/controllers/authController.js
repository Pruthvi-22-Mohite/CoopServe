import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { inMemoryStore } from '../store/inMemoryStore.js';
import { DEMO_ACCOUNTS, ROLES } from '../config/constants.js';

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, tokenVersion: user.tokenVersion || 0 },
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

    const user = inMemoryStore.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User with this email does not exist.'
      });
    }

    // Explicit demo vs registered account verification
    if (user.isDemoAccount) {
      // For published demo accounts, allow known demo passwords without bcrypt hashing
      const isDemoMatch = user.password === password || password === 'demo123' || password === 'password123';
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

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setRefreshTokenCookie(res, refreshToken);

    const { password: _, ...userWithoutPassword } = user;

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

    const demoUser = inMemoryStore.users.find(u => u.role === targetRole);

    if (!demoUser) {
      return res.status(404).json({
        success: false,
        message: `No demo account found for role: ${role}`
      });
    }

    const accessToken = generateAccessToken(demoUser);
    const refreshToken = generateRefreshToken(demoUser);
    setRefreshTokenCookie(res, refreshToken);

    const { password: _, ...userWithoutPassword } = demoUser;

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

    const existingUser = inMemoryStore.findUserByEmail(email);
    if (existingUser) {
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
      email,
      password: hashedPassword,
      role: mappedRole,
      phone: phone || '+91 90000 00000',
      location: location || 'Pune, MH',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
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

    const newUser = inMemoryStore.addUser(userData);
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    setRefreshTokenCookie(res, refreshToken);

    const { password: _, ...userWithoutPassword } = newUser;

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

    const user = inMemoryStore.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to token no longer exists.'
      });
    }

    // Revocation and tokenVersion check
    if (
      decoded.tokenVersion === undefined ||
      decoded.tokenVersion !== user.tokenVersion ||
      inMemoryStore.isTokenRevoked(user.id, decoded.tokenVersion)
    ) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has been revoked or invalidated.'
      });
    }

    // Invalidate old token by incrementing tokenVersion & issue new rotated tokens
    inMemoryStore.incrementTokenVersion(user.id);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    setRefreshTokenCookie(res, newRefreshToken);

    const { password: _, ...userWithoutPassword } = user;

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
