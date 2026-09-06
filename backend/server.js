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
import { getLocations } from './src/controllers/authController.js';

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

io.on('connection', (socket) => {
  socket.on('join_booking', (bookingId) => {
    socket.join(bookingId);
  });
});

// Middleware
app.use(cors({
  origin: clientOrigin,
  credentials: true
}));
app.use(express.json());
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

// Socket.IO real-time connection handler
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 CoopServe Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO initialized and listening for events`);
  });
};

startServer();
