import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import healthRoutes from './src/routes/healthRoutes.js';
import serviceRoutes from './src/routes/serviceRoutes.js';
import providerRoutes from './src/routes/providerRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import customerRoutes from './src/routes/customerRoutes.js';
import providerModuleRoutes from './src/routes/providerModuleRoutes.js';
import cooperativeRoutes from './src/routes/cooperativeRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import ratingRoutes from './src/routes/ratingRoutes.js';
import { getLocations } from './src/controllers/authController.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Booking from './src/models/Booking.js';
import User from './src/models/User.js';
import { inMemoryStore } from './src/store/inMemoryStore.js';
import { isUserAuthorizedForBooking } from './src/middleware/authMiddleware.js';

dotenv.config();

// Validate critical security environment variables on startup
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables — server will not start');
}
if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET is not set in environment variables — server will not start');
}

const app = express();
const server = http.createServer(app);

// Socket.IO configuration
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors({
  origin: clientOrigin,
  credentials: true
}));

// Scoped raw body parser for Razorpay webhook signature verification (must be before global express.json)
app.use('/api/payments/webhook', express.raw({ type: '*/*' }), (req, res, next) => {
  if (Buffer.isBuffer(req.body)) {
    req.rawBody = req.body.toString('utf8');
  } else if (typeof req.body === 'string') {
    req.rawBody = req.body;
  }
  next();
});

app.use(express.json({
  verify: (req, res, buf) => {
    if (!req.rawBody && buf) {
      req.rawBody = buf.toString('utf8');
    }
  }
}));
app.use(morgan('dev'));

// Attach io to requests for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/locations', getLocations);
app.use('/api/services', serviceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/provider', providerModuleRoutes);
app.use('/api/cooperative', cooperativeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'CoopServe Backend Engine',
    tagline: 'Trusted Local Services. Fair Opportunities. Stronger Communities.',
    edition: 'Enterprise Cooperative Platform',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      services: '/api/services',
      providers: '/api/providers',
      bookings: '/api/bookings',
      customer: '/api/customer'
    }
  });
});

// Helper to resolve user from token or ID for Socket.IO connections
const resolveSocketUser = async (tokenOrId, roleHint) => {
  if (!tokenOrId) return null;

  // If JWT string
  if (typeof tokenOrId === 'string' && tokenOrId.includes('.')) {
    try {
      const cleanToken = tokenOrId.startsWith('Bearer ') ? tokenOrId.split(' ')[1] : tokenOrId;
      const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
      if (decoded?.id) {
        let user = null;
        if (mongoose.isValidObjectId(decoded.id)) {
          user = await User.findOne({ $or: [{ _id: decoded.id }, { id: decoded.id }] });
        } else {
          user = await User.findOne({ id: decoded.id });
        }
        if (!user) user = inMemoryStore.findUserById(decoded.id);

        if (user) {
          const userObj = user.toObject ? user.toObject() : user;
          return {
            id: userObj.id || userObj._id?.toString(),
            _id: userObj._id?.toString(),
            role: userObj.role,
            name: userObj.name,
            email: userObj.email
          };
        }
        return { id: decoded.id, role: decoded.role || 'CUSTOMER' };
      }
    } catch (e) {
      // Invalid token
    }
  }

  // If userId
  if (typeof tokenOrId === 'string') {
    let user = null;
    if (mongoose.isValidObjectId(tokenOrId)) {
      user = await User.findOne({ $or: [{ _id: tokenOrId }, { id: tokenOrId }] });
    } else {
      user = await User.findOne({ id: tokenOrId });
    }
    if (!user) user = inMemoryStore.findUserById(tokenOrId);

    if (user) {
      const userObj = user.toObject ? user.toObject() : user;
      return {
        id: userObj.id || userObj._id?.toString(),
        _id: userObj._id?.toString(),
        role: userObj.role,
        name: userObj.name,
        email: userObj.email
      };
    }
    if (roleHint) {
      return { id: tokenOrId, role: roleHint };
    }
  }

  return null;
};

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const authHeader = socket.handshake.headers?.authorization;
    const token = socket.handshake.auth?.token ||
                  socket.handshake.query?.token ||
                  (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);

    if (token) {
      const user = await resolveSocketUser(token);
      if (user) {
        socket.user = user;
      }
    } else if (socket.handshake.auth?.userId) {
      const user = await resolveSocketUser(socket.handshake.auth.userId, socket.handshake.auth.role);
      if (user) {
        socket.user = user;
      }
    }
  } catch (err) {
    console.warn('[Socket.IO Auth Middleware Note]', err.message);
  }
  next();
});

// Socket.IO real-time connection handler
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Automatically join personal user and role rooms if authenticated
  if (socket.user) {
    const uid = socket.user.id;
    if (uid) socket.join(uid);
    if (socket.user._id && socket.user._id !== uid) socket.join(socket.user._id);
    const roleUpper = (socket.user.role || '').toUpperCase();
    if (roleUpper === 'ADMIN') socket.join('admin');
    if (roleUpper === 'SERVICE_PROVIDER' && uid) socket.join(`provider_${uid}`);
  }

  // Allow client to authenticate after initial connection
  socket.on('authenticate', async (authPayload, ack) => {
    const token = authPayload?.token || (typeof authPayload === 'string' ? authPayload : null);
    const userId = authPayload?.userId;
    let user = null;
    if (token) {
      user = await resolveSocketUser(token);
    } else if (userId) {
      user = await resolveSocketUser(userId, authPayload?.role);
    }
    if (user) {
      socket.user = user;
      if (user.id) socket.join(user.id);
      const roleUpper = (user.role || '').toUpperCase();
      if (roleUpper === 'ADMIN') socket.join('admin');
      if (ack) ack({ success: true, user });
      socket.emit('authenticated', { success: true, user });
    } else {
      if (ack) ack({ success: false, message: 'Authentication failed' });
      socket.emit('auth_error', { success: false, message: 'Authentication failed' });
    }
  });

  // Task 4: Secure join_booking handler — only authorized customers, providers, and admins may join
  socket.on('join_booking', async (data, maybeAuth, maybeCallback) => {
    let bookingId = typeof data === 'string' ? data : (data?.bookingId || data?.id);
    let authData = typeof data === 'object' && data !== null ? data : (typeof maybeAuth === 'object' ? maybeAuth : null);
    let callback = typeof maybeAuth === 'function' ? maybeAuth : (typeof maybeCallback === 'function' ? maybeCallback : null);

    if (!bookingId) {
      const errPayload = { success: false, message: 'Booking ID is required to join booking room.' };
      if (callback) callback(errPayload);
      return socket.emit('join_booking_error', errPayload);
    }

    // Resolve user identity from socket session or event credentials
    let user = socket.user;
    if (!user) {
      const candidateToken = authData?.token || (typeof maybeAuth === 'string' && maybeAuth.includes('.') ? maybeAuth : null);
      if (candidateToken) {
        user = await resolveSocketUser(candidateToken);
      }
    }
    if (!user && (authData?.userId || (typeof maybeAuth === 'string' && !maybeAuth.includes('.')))) {
      const candidateId = authData?.userId || maybeAuth;
      user = await resolveSocketUser(candidateId, authData?.role);
    }
    if (!user && authData?.user) {
      user = authData.user;
    }

    if (!user) {
      const errPayload = {
        success: false,
        message: 'Unauthorized: Authentication required to join booking room.'
      };
      if (callback) callback(errPayload);
      return socket.emit('join_booking_error', errPayload);
    }

    try {
      // Find booking in MongoDB
      const bookingQuery = mongoose.isValidObjectId(bookingId)
        ? { $or: [{ _id: bookingId }, { id: bookingId }] }
        : { id: bookingId };

      const booking = await Booking.findOne(bookingQuery);
      if (!booking) {
        const errPayload = { success: false, message: `Booking '${bookingId}' not found.` };
        if (callback) callback(errPayload);
        return socket.emit('join_booking_error', errPayload);
      }

      // Check authorization: Customer, Provider, or Admin
      const isAuthorized = await isUserAuthorizedForBooking(user, booking);
      if (!isAuthorized) {
        const errPayload = {
          success: false,
          message: 'Forbidden: You are not authorized to join this booking room.'
        };
        if (callback) callback(errPayload);
        return socket.emit('join_booking_error', errPayload);
      }

      // User is authorized: join booking room
      const roomId = booking.id || bookingId;
      socket.join(roomId);
      console.log(`[Socket.IO] Authorized socket ${socket.id} (${user.role} ${user.id}) joined booking room: ${roomId}`);

      const successPayload = {
        success: true,
        message: `Successfully joined booking room ${roomId}`,
        bookingId: roomId
      };
      if (callback) callback(successPayload);
      socket.emit('joined_booking', successPayload);
    } catch (err) {
      console.error('[Socket.IO join_booking error]', err);
      const errPayload = { success: false, message: 'Error checking booking room authorization' };
      if (callback) callback(errPayload);
      socket.emit('join_booking_error', errPayload);
    }
  });

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`[Socket.IO] Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[CoopServe API Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 CoopServe Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO initialized and listening for events`);
  });
};

startServer();
