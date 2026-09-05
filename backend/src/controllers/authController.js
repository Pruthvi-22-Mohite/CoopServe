import jwt from 'jsonwebtoken';
import { inMemoryStore } from '../store/inMemoryStore.js';
import { DEMO_ACCOUNTS, ROLES } from '../config/constants.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'coopserve_jwt_secret_production_key_2026',
    { expiresIn: '7d' }
  );
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

    // In demo environment, allow 'password123' or exact match
    if (user.password !== password && password !== 'demo123' && password !== 'password123') {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. For demo accounts use: password123'
      });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
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

    const token = generateToken(demoUser);
    const { password: _, ...userWithoutPassword } = demoUser;

    return res.status(200).json({
      success: true,
      message: `Switched to Demo ${demoUser.role} (${demoUser.name})`,
      token,
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

    const mappedRole = (role === 'SERVICE_PROVIDER' || role === 'PROVIDER')
      ? ROLES.SERVICE_PROVIDER
      : role === 'ADMIN'
      ? ROLES.ADMIN
      : ROLES.CUSTOMER;

    const userData = {
      name,
      email,
      password,
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
    const token = generateToken(newUser);
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
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
