import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, ShieldAlert, CheckCircle2, Zap } from 'lucide-react';

export default function BookingModal({ vehicle, user, isOpen, onClose, onBookingSuccess }) {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [durationType, setDurationType] = useState('daily');
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [conflictReason, setConflictReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (vehicle && startDate && endDate) {
      checkAvailability();
    }
  }, [vehicle, startDate, endDate]);

  if (!isOpen || !vehicle) return null;

  // Calculate total rental days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(1, end.getTime() - start.getTime());
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Calculate Price Tier & Savings
  let totalPrice = 0;
  let savingsPercentage = 0;

  if (totalDays >= 30) {
    const monthlyRatePerDay = vehicle.monthly_rate / 30;
    totalPrice = Math.round(monthlyRatePerDay * totalDays);
    savingsPercentage = Math.round(((vehicle.daily_rate * totalDays - totalPrice) / (vehicle.daily_rate * totalDays)) * 100);
  } else if (totalDays >= 7) {
    const weeklyRatePerDay = vehicle.weekly_rate / 7;
    totalPrice = Math.round(weeklyRatePerDay * totalDays);
    savingsPercentage = Math.round(((vehicle.daily_rate * totalDays - totalPrice) / (vehicle.daily_rate * totalDays)) * 100);
  } else {
    totalPrice = vehicle.daily_rate * totalDays;
  }

  const checkAvailability = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/bookings/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: vehicle._id,
          start_date: startDate,
          end_date: endDate
        })
      });
      const data = await res.json();
      setIsAvailable(data.available);
      setConflictReason(data.conflictReason || '');
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const handleBook = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: vehicle._id,
          vehicle_name: vehicle.name,
          vehicle_image: vehicle.image_url,
          customer_id: user ? user._id : 'usr_customer_1',
          customer_name: user ? user.name : 'Alex Johnson',
          customer_email: user ? user.email : 'alex@example.com',
          agency_id: vehicle.owner_id || 'usr_agency_1',
          start_date: startDate,
          end_date: endDate,
          rental_duration_type: totalDays >= 30 ? 'monthly' : totalDays >= 7 ? 'weekly' : 'daily',
          total_days: totalDays,
          total_price: totalPrice
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place booking');

      onBookingSuccess(data);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <span className={`status-pill ${vehicle.vehicle_type === '2W' ? 'badge-2w' : 'badge-4w'}`}>
              {vehicle.vehicle_type === '2W' ? '2-Wheeler' : '4-Wheeler'}
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '0.4rem' }}>
              Book {vehicle.name}
            </h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
          <img src={vehicle.image_url} alt={vehicle.name} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{vehicle.brand} • {vehicle.year}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)' }}>{vehicle.location}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
              Fuel: {vehicle.fuel_type} | Transmission: {vehicle.transmission}
            </div>
          </div>
        </div>

        {/* Dates selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="search-field">
            <label>Pickup Date</label>
            <input
              type="date"
              value={startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="search-field">
            <label>Return Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Real-time availability indicator */}
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: checking ? 'rgba(255,255,255,0.05)' : isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          color: checking ? 'var(--text-muted)' : isAvailable ? '#34d399' : '#f87171',
          border: `1px solid ${checking ? 'var(--border-color)' : isAvailable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
        }}>
          {checking ? (
            <span>Checking availability...</span>
          ) : isAvailable ? (
            <>
              <CheckCircle2 size={18} />
              <span>Vehicle is available for selected dates!</span>
            </>
          ) : (
            <>
              <ShieldAlert size={18} />
              <span>{conflictReason}</span>
            </>
          )}
        </div>

        {/* Pricing Summary */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
            <span style={{ fontWeight: 600 }}>{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Pricing Model:</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
              {totalDays >= 30 ? 'Monthly Discounted Tier' : totalDays >= 7 ? 'Weekly Discounted Tier' : 'Daily Tier'}
            </span>
          </div>

          {savingsPercentage > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <Zap size={14} /> You save {savingsPercentage}% compared to single daily rates!
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Total Rental Cost:</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-heading)' }}>
              ${totalPrice}
            </span>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%' }}
          disabled={!isAvailable || checking || submitting}
          onClick={handleBook}
        >
          {submitting ? 'Confirming Booking...' : 'Confirm & Request Booking'}
        </button>
      </div>
    </div>
  );
}
