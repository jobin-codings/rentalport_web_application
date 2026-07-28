const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB, getMongoStatus } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'DriveNow Vehicle Rental API',
    mongoStatus: getMongoStatus() ? 'Connected to MongoDB Atlas' : 'Operating via memory store fallback',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Initialize DB and Start Server
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 DriveNow Backend API running at http://localhost:${PORT}`);
    });
  });
}

module.exports = app;
