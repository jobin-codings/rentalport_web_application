const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dataStore = require('../services/dataStore');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { getMongoStatus } = require('../config/db');

let BID_COUNTER = 1000;

// Helper to build safe Mongoose query without CastError on ObjectId
const buildMongoIdQuery = (idParam) => {
  if (!idParam) return {};
  const isObjId = mongoose.Types.ObjectId.isValid(idParam) && String(new mongoose.Types.ObjectId(idParam)) === String(idParam);
  if (isObjId) {
    return { $or: [{ id: idParam }, { _id: idParam }] };
  }
  return { id: idParam };
};

// Submit new booking request
router.post('/', async (req, res) => {
  try {
    let { vehicleId, vehicleName, emoji, customerEmail, customerName, ownerEmail, from, to, pickupTime, returnTime, durationPlan, city, total } = req.body;

    if (!vehicleId || !customerEmail || !from || !to || total === undefined || total === null) {
      return res.status(400).json({ error: 'Missing required booking details' });
    }

    const finalTotal = (Number(total) && Number(total) > 0) ? Number(total) : 2200;

    // Normalize email addresses to lower-case trimmed format
    const cleanCustomerEmail = String(customerEmail).trim().toLowerCase();
    const cleanOwnerEmail = ownerEmail ? String(ownerEmail).trim().toLowerCase() : 'partner@example.com';

    BID_COUNTER++;
    const bookingId = `BK-${BID_COUNTER}`;

    if (getMongoStatus()) {
      const newBooking = await Booking.create({
        id: bookingId,
        vehicleId,
        vehicleName,
        emoji: emoji || '',
        customerEmail: cleanCustomerEmail,
        customerName: customerName || cleanCustomerEmail,
        ownerEmail: cleanOwnerEmail,
        from,
        to,
        pickupTime: pickupTime || '09:00',
        returnTime: returnTime || '17:00',
        durationPlan: durationPlan || 'daily',
        city: city || 'Austin',
        total: finalTotal,
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
        emoji: emoji || '',
        customerEmail: cleanCustomerEmail,
        customerName: customerName || cleanCustomerEmail,
        ownerEmail: cleanOwnerEmail,
        from,
        to,
        pickupTime: pickupTime || '09:00',
        returnTime: returnTime || '17:00',
        durationPlan: durationPlan || 'daily',
        city: city || 'Austin',
        total: finalTotal,
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
      const query = customerEmail ? { customerEmail: new RegExp('^' + customerEmail.trim() + '$', 'i') } : {};
      list = await Booking.find(query).sort({ createdAt: -1 });
    } else {
      list = dataStore.getBookings();
      if (customerEmail) {
        const cleanEmail = customerEmail.trim().toLowerCase();
        list = list.filter(b => b.customerEmail && b.customerEmail.trim().toLowerCase() === cleanEmail);
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
      const vQuery = buildMongoIdQuery(vehicleId);
      const targetVehicle = await Vehicle.findOne(vQuery);
      const vehicleKey = targetVehicle ? targetVehicle.id : vehicleId;

      bookingsList = await Booking.find({
        $or: [{ vehicleId }, { vehicleId: vehicleKey }],
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
      const query = ownerEmail ? { ownerEmail: new RegExp('^' + ownerEmail.trim() + '$', 'i') } : {};
      list = await Booking.find(query).sort({ createdAt: -1 });
    } else {
      list = dataStore.getBookings();
      if (ownerEmail) {
        const cleanEmail = ownerEmail.trim().toLowerCase();
        list = list.filter(b => b.ownerEmail && b.ownerEmail.trim().toLowerCase() === cleanEmail);
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

    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    if (getMongoStatus()) {
      const bQuery = buildMongoIdQuery(id);
      const updated = await Booking.findOneAndUpdate(bQuery, { status }, { new: true });
      if (updated && status === 'approved') {
        const vQuery = buildMongoIdQuery(updated.vehicleId);
        await Vehicle.findOneAndUpdate(vQuery, { available: false });
      } else if (updated && (status === 'cancelled' || status === 'rejected')) {
        const vQuery = buildMongoIdQuery(updated.vehicleId);
        await Vehicle.findOneAndUpdate(vQuery, { available: true });
      }
      return res.json(updated);
    } else {
      const updated = dataStore.updateBooking(id, { status });
      if (updated && status === 'approved') {
        dataStore.updateVehicle(updated.vehicleId, { available: false });
      } else if (updated && (status === 'cancelled' || status === 'rejected')) {
        dataStore.updateVehicle(updated.vehicleId, { available: true });
      }
      return res.json(updated);
    }
  } catch (err) {
    console.error('Update Booking Status Error:', err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Process Payment
router.put('/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    if (getMongoStatus()) {
      const bQuery = buildMongoIdQuery(id);
      const updated = await Booking.findOneAndUpdate(bQuery, { paymentStatus: 'paid' }, { new: true });
      return res.json(updated);
    } else {
      const updated = dataStore.updateBooking(id, { paymentStatus: 'paid' });
      return res.json(updated);
    }
  } catch (err) {
    console.error('Process Payment Error:', err);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

module.exports = router;
