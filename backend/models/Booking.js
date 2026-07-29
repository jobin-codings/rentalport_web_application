const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true },
  vehicleName: { type: String, required: true },
  emoji: { type: String, default: '' },
  customerEmail: { type: String, required: true },
  customerName: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  pickupTime: { type: String, default: '09:00' },
  returnTime: { type: String, default: '17:00' },
  durationPlan: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
  city: { type: String, required: true },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'cancelled'], 
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['unpaid', 'paid'], 
    default: 'unpaid' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
