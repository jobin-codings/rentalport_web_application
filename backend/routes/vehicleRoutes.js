const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const Vehicle = require('../models/Vehicle');
const { getMongoStatus } = require('../config/db');

// Get all vehicles with filtering
router.get('/', async (req, res) => {
  try {
    const { city, kind, fuel, maxPrice, status, ownerEmail, inMaintenance } = req.query;

    let list = [];
    if (getMongoStatus()) {
      let filter = {};
      if (status) filter.status = status;
      if (city) filter.city = city;
      if (kind) filter.kind = kind;
      if (fuel) filter.fuel = fuel;
      if (ownerEmail) filter.ownerEmail = ownerEmail;
      if (inMaintenance !== undefined) filter.inMaintenance = inMaintenance === 'true';
      list = await Vehicle.find(filter);
    } else {
      list = dataStore.getVehicles();
      if (status) list = list.filter(v => v.status === status);
      if (city) list = list.filter(v => v.city === city);
      if (kind) list = list.filter(v => v.kind === kind);
      if (fuel) list = list.filter(v => v.fuel === fuel);
      if (ownerEmail) list = list.filter(v => v.ownerEmail === ownerEmail);
      if (inMaintenance !== undefined) list = list.filter(v => v.inMaintenance === (inMaintenance === 'true'));
    }

    if (maxPrice) {
      list = list.filter(v => v.rate <= Number(maxPrice));
    }

    res.json(list);
  } catch (err) {
    console.error('Fetch Vehicles Error:', err);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Create new vehicle listing (Partner)
router.post('/', async (req, res) => {
  try {
    const { name, kind, tagline, city, rate, weeklyRate, monthlyRate, seats, transmission, fuel, image, ownerEmail, vehicleNumber, brand, model } = req.body;

    if (!name || !tagline || !city || !rate || !seats || !ownerEmail) {
      return res.status(400).json({ error: 'Fill in every field before saving.' });
    }

    dataStore.addCity(city);

    const emojiMap = { car: '🚗', bike: '🏍️' };
    const bgPalette = ['#1E293B', '#0F172A', '#131A29', '#151D30'];
    const randomBg = bgPalette[Math.floor(Math.random() * bgPalette.length)];
    const newId = `v${Date.now()}`;
    const vRate = Number(rate);
    const wRate = weeklyRate ? Number(weeklyRate) : Math.round(vRate * 6);
    const mRate = monthlyRate ? Number(monthlyRate) : Math.round(vRate * 22);
    const regNum = vehicleNumber || `REG-${Math.floor(1000 + Math.random() * 9000)}`;

    if (getMongoStatus()) {
      const newVeh = await Vehicle.create({
        id: newId,
        vehicleNumber: regNum,
        brand: brand || name.split(' ')[0],
        model: model || name,
        kind,
        emoji: emojiMap[kind] || '🚗',
        name,
        tagline,
        city,
        rate: vRate,
        weeklyRate: wRate,
        monthlyRate: mRate,
        seats: Number(seats),
        transmission: transmission || 'Automatic',
        fuel: fuel || 'Petrol',
        bg: randomBg,
        image: image || '',
        ownerEmail,
        status: 'pending',
        available: true,
        inMaintenance: false
      });
      return res.status(201).json(newVeh);
    } else {
      const newVeh = {
        _id: `veh_${Date.now()}`,
        id: newId,
        vehicleNumber: regNum,
        brand: brand || name.split(' ')[0],
        model: model || name,
        kind,
        emoji: emojiMap[kind] || '🚗',
        name,
        tagline,
        city,
        rate: vRate,
        weeklyRate: wRate,
        monthlyRate: mRate,
        seats: Number(seats),
        transmission: transmission || 'Automatic',
        fuel: fuel || 'Petrol',
        bg: randomBg,
        image: image || '',
        ownerEmail,
        status: 'pending',
        available: true,
        inMaintenance: false
      };
      dataStore.addVehicle(newVeh);
      return res.status(201).json(newVeh);
    }
  } catch (err) {
    console.error('Create Vehicle Error:', err);
    res.status(500).json({ error: 'Failed to create vehicle listing' });
  }
});

// Update vehicle listing
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (getMongoStatus()) {
      const updated = await Vehicle.findOneAndUpdate({ id }, { ...updates, status: 'pending' }, { new: true });
      return res.json(updated);
    } else {
      const updated = dataStore.updateVehicle(id, { ...updates, status: 'pending' });
      return res.json(updated);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Toggle vehicle maintenance status (Partner)
router.put('/:id/maintenance', async (req, res) => {
  try {
    const { id } = req.params;
    const { inMaintenance } = req.body;

    if (getMongoStatus()) {
      const updated = await Vehicle.findOneAndUpdate(
        { id },
        { inMaintenance: Boolean(inMaintenance), available: !inMaintenance },
        { new: true }
      );
      return res.json(updated);
    } else {
      const updated = dataStore.updateVehicle(id, {
        inMaintenance: Boolean(inMaintenance),
        available: !inMaintenance
      });
      return res.json(updated);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle maintenance status' });
  }
});

// Approve/Reject status update (Admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (getMongoStatus()) {
      const updated = await Vehicle.findOneAndUpdate({ id }, { status }, { new: true });
      return res.json(updated);
    } else {
      const updated = dataStore.updateVehicle(id, { status });
      return res.json(updated);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete vehicle listing (Partner/Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (getMongoStatus()) {
      await Vehicle.findOneAndDelete({ id });
      return res.json({ message: 'Vehicle deleted' });
    } else {
      dataStore.removeVehicle(id);
      return res.json({ message: 'Vehicle deleted' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

module.exports = router;
