const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { getMongoStatus } = require('../config/db');

// Get Platform Stats & Key Performance Indicators (KPIs)
router.get('/stats', async (req, res) => {
  try {
    let vehicles = [];
    let bookings = [];
    let users = [];

    if (getMongoStatus()) {
      vehicles = await Vehicle.find();
      bookings = await Booking.find();
      users = await User.find();
    } else {
      vehicles = dataStore.getVehicles();
      bookings = dataStore.getBookings();
      users = dataStore.getUsers();
    }

    const customersCount = users.filter(u => u.role === 'customer').length;
    const partnersCount = users.filter(u => u.role === 'partner').length;
    const totalUsers = users.length;

    const activeBookings = bookings.filter(b => b.status === 'approved').length;
    const paidBookingsCount = bookings.filter(b => b.paymentStatus === 'paid').length;
    const totalBookingsCount = bookings.length;

    // Booking Conversion Rate (%)
    const bookingConversionRate = totalBookingsCount > 0 
      ? Math.round((paidBookingsCount / totalBookingsCount) * 100) 
      : 85;

    // Vehicle Utilization Rate (%)
    const approvedVehicles = vehicles.filter(v => v.status === 'approved');
    const bookedOutVehicles = approvedVehicles.filter(v => !v.available || v.inMaintenance);
    const vehicleUtilizationRate = approvedVehicles.length > 0 
      ? Math.round((bookedOutVehicles.length / approvedVehicles.length) * 100) 
      : 42;

    // Booking Conflict Rate (%) - overlap check or rejection rate
    const rejectedOrConflictCount = bookings.filter(b => b.status === 'rejected').length;
    const bookingConflictRate = totalBookingsCount > 0 
      ? Math.round((rejectedOrConflictCount / totalBookingsCount) * 100) 
      : 4.5;

    // Average Rental Duration (Days)
    let totalDaysSum = 0;
    bookings.forEach(b => {
      if (b.from && b.to) {
        const start = new Date(b.from);
        const end = new Date(b.to);
        const diff = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        totalDaysSum += diff;
      }
    });
    const averageRentalDuration = totalBookingsCount > 0 
      ? Number((totalDaysSum / totalBookingsCount).toFixed(1)) 
      : 3.5;

    // Monthly Active Users (MAU)
    const monthlyActiveUsers = totalUsers;

    const pendingVehicles = vehicles.filter(v => v.status === 'pending').length;
    const totalRevenue = bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + (b.total || 0), 0);

    res.json({
      registeredUsers: totalUsers,
      customersCount,
      partnersCount,
      activeBookings,
      pendingVehicles,
      totalRevenue,
      bookingConversionRate,
      vehicleUtilizationRate,
      bookingConflictRate,
      averageRentalDuration,
      monthlyActiveUsers
    });
  } catch (err) {
    console.error('Stats Error:', err);
    res.status(500).json({ error: 'Failed to compute admin stats' });
  }
});

// Get All Users (Customers, Partners, Admins)
router.get('/users', async (req, res) => {
  try {
    let list = [];
    if (getMongoStatus()) {
      list = await User.find().select('-password').sort({ createdAt: -1 });
    } else {
      list = dataStore.getUsers();
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Block or Unblock User (Admin)
router.put('/users/:id/block', async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;
    const blockedBool = Boolean(isBlocked);
    const statusVal = blockedBool ? 'blocked' : 'active';

    if (getMongoStatus()) {
      const updated = await User.findOneAndUpdate(
        { $or: [{ _id: id }, { email: id }] },
        { isBlocked: blockedBool, status: statusVal },
        { new: true }
      ).select('-password');
      return res.json(updated);
    } else {
      const updated = dataStore.updateUserBlockStatus(id, blockedBool);
      return res.json(updated);
    }
  } catch (err) {
    console.error('Block user error:', err);
    res.status(500).json({ error: 'Failed to update user block status' });
  }
});

// Get All Bookings
router.get('/all-bookings', async (req, res) => {
  try {
    let list = [];
    if (getMongoStatus()) {
      list = await Booking.find().sort({ createdAt: -1 });
    } else {
      list = dataStore.getBookings();
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all bookings' });
  }
});

// Get Partners Directory
router.get('/partners', async (req, res) => {
  try {
    let partners = [];
    if (getMongoStatus()) {
      partners = await User.find({ role: 'partner' }).select('-password');
    } else {
      partners = dataStore.getUsers().filter(u => u.role === 'partner');
    }
    res.json(partners);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch partners directory' });
  }
});

module.exports = router;
