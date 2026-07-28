const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { getMongoStatus } = require('../config/db');

let BID_COUNTER = 1000;

// Submit new booking request
router.post('/', async (req, res) => {
  try {
    const { vehicleId, vehicleName, emoji, customerEmail, customerName, ownerEmail, from, to, city, total } = req.body;

    if (!vehicleId || !customerEmail || !from || !to || !total) {
      return res.status(400).json({ error: 'Missing required booking details' });
    }

    BID_COUNTER++;
    const bookingId = `BK-${BID_COUNTER}`;

    if (getMongoStatus()) {
      const newBooking = await Booking.create({
        id: bookingId,
        vehicleId,
        vehicleName,
        emoji,
        customerEmail,
        customerName,
        ownerEmail,
        from,
        to,
        city,
        total: Number(total),
        status: 'pending',
        paymentStatus: 'unpaid'
      });
      return res.status(201).json(newBooking);
    } else {
      const newBooking = {
        _id: `bk_${Date.now()}`,
        id: bookingId,
        vehicleId,
        vehicleName,
        emoji,
        customerEmail,
        customerName,
        ownerEmail,
        from,
        to,
        city,
        total: Number(total),
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString()
      };
      dataStore.addBooking(newBooking);
      return res.status(201).json(newBooking);
    }
  } catch (err) {
    console.error('Create Booking Error:', err);
    res.status(500).json({ error: 'Failed to submit booking request' });
  }
});

// Customer booking history
router.get('/my-bookings', async (req, res) => {
  try {
    const { customerEmail } = req.query;
    let list = [];

    if (getMongoStatus()) {
      list = await Booking.find(customerEmail ? { customerEmail } : {}).sort({ createdAt: -1 });
    } else {
      list = dataStore.getBookings();
      if (customerEmail) {
        list = list.filter(b => b.customerEmail === customerEmail);
      }
    }

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer bookings' });
  }
});

// Fetch all booked date ranges for a specific vehicle (to show availability calendar and prevent conflict)
router.get('/vehicle-dates/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    let bookingsList = [];

    if (getMongoStatus()) {
      bookingsList = await Booking.find({
        vehicleId,
        status: { $in: ['approved', 'pending'] }
      }).select('from to status paymentStatus id customerName');
    } else {
      bookingsList = dataStore.getBookings().filter(b => 
        (b.vehicleId === vehicleId || b.vehicleId === String(vehicleId)) && 
        ['approved', 'pending'].includes(b.status)
      );
    }

    res.json(bookingsList);
  } catch (err) {
    console.error('Fetch Vehicle Booked Dates Error:', err);
    res.status(500).json({ error: 'Failed to fetch booked dates for vehicle' });
  }
});

// Partner incoming requests
router.get('/partner-bookings', async (req, res) => {
  try {
    const { ownerEmail } = req.query;
    let list = [];

    if (getMongoStatus()) {
      list = await Booking.find(ownerEmail ? { ownerEmail } : {}).sort({ createdAt: -1 });
    } else {
      list = dataStore.getBookings();
      if (ownerEmail) {
        list = list.filter(b => b.ownerEmail === ownerEmail);
      }
    }

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch partner bookings' });
  }
});

// Partner Grant / Decline booking request OR Customer Cancel
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (getMongoStatus()) {
      const updated = await Booking.findOneAndUpdate({ id }, { status }, { new: true });
      if (updated && status === 'approved') {
        await Vehicle.findOneAndUpdate({ id: updated.vehicleId }, { available: false });
      } else if (updated && status === 'cancelled') {
        await Vehicle.findOneAndUpdate({ id: updated.vehicleId }, { available: true });
      }
      return res.json(updated);
    } else {
      const updated = dataStore.updateBooking(id, { status });
      if (updated && status === 'approved') {
        dataStore.updateVehicle(updated.vehicleId, { available: false });
      } else if (updated && status === 'cancelled') {
        dataStore.updateVehicle(updated.vehicleId, { available: true });
      }
      return res.json(updated);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Process Payment
router.put('/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;

    if (getMongoStatus()) {
      const updated = await Booking.findOneAndUpdate({ id }, { paymentStatus: 'paid' }, { new: true });
      return res.json(updated);
    } else {
      const updated = dataStore.updateBooking(id, { paymentStatus: 'paid' });
      return res.json(updated);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

module.exports = router;
