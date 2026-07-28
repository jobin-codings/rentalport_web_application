const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  vehicleNumber: { type: String, default: '' },
  brand: { type: String, default: '' },
  model: { type: String, default: '' },
  kind: { type: String, enum: ['car', 'bike'], required: true },
  emoji: { type: String, required: true },
  name: { type: String, required: true },
  tagline: { type: String, required: true },
  city: { type: String, required: true },
  seats: { type: Number, required: true },
  transmission: { type: String, default: 'Automatic' },
  fuel: { type: String, default: 'Petrol' },
  rate: { type: Number, required: true },
  weeklyRate: { type: Number },
  monthlyRate: { type: Number },
  bg: { type: String, default: '#FFE3CF' },
  image: { type: String, default: '' },
  ownerEmail: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  available: { type: Boolean, default: true },
  inMaintenance: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
