import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, CheckCircle2, Calendar, Shield, DollarSign, Clock, Tag, AlertCircle } from 'lucide-react';
import AvailabilityCalendar from './AvailabilityCalendar';

export default function BookingFlow({ vehicle, user, initialStep, initialBooking, onBackToFleet, onViewBookings, onRequestConfirmation }) {
  const [step, setStep] = useState(initialStep || 'form'); // 'form' | 'payment' | 'receipt'
  
  // Form dates & times
  const todayISO = (offsetDays) => {
    const d = new Date(); d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  };

  const [fromDate, setFromDate] = useState(todayISO(1));
  const [toDate, setToDate] = useState(todayISO(3));
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnTime, setReturnTime] = useState('17:00');
  const [durationPlan, setDurationPlan] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  const [err, setErr] = useState('');
  const [bookedDates, setBookedDates] = useState([]);

  // Payment form
  const [payCard, setPayCard] = useState('');
  const [payExp, setPayExp] = useState('');
  const [payCvc, setPayCvc] = useState('');
  const [payErr, setPayErr] = useState('');

  // Active booking object (created or retrieved)
  const [booking, setBooking] = useState(initialBooking || null);

  useEffect(() => {
    if (initialStep) setStep(initialStep);
    if (initialBooking) setBooking(initialBooking);
  }, [initialStep, initialBooking]);

  useEffect(() => {
    if (vehicle) {
      fetchBookedDates();
    }
  }, [vehicle]);

  const fetchBookedDates = async () => {
    try {
      const targetId = vehicle.id || vehicle._id;
      const res = await fetch(`/api/bookings/vehicle-dates/${targetId}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const setBookings = (data) => setBookedDates(data);

  const targetVehicle = vehicle || (booking ? { name: booking.vehicleName, city: booking.city } : null);

  // Accurate duration calculation in days
  const calculateDays = () => {
    if (!fromDate || !toDate) return 0;
    const s = new Date(fromDate);
    const e = new Date(toDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 0;
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 0;
    return diff === 0 ? 1 : diff; // Same day pickup & return counts as 1 day rental
  };

  const validDays = calculateDays();

  // Precise total cost calculation
  const calculateTotalCost = () => {
    if (!vehicle || validDays <= 0) return 0;
    const dailyRate = Number(vehicle.rate) || 0;
    const weeklyRate = Number(vehicle.weeklyRate) || Math.round(dailyRate * 6);
    const monthlyRate = Number(vehicle.monthlyRate) || Math.round(dailyRate * 22);

    if (durationPlan === 'weekly') {
      const weeks = Math.floor(validDays / 7);
      const remDays = validDays % 7;
      if (weeks > 0) {
        return (weeks * weeklyRate) + (remDays * Math.round(weeklyRate / 7));
      } else {
        return Math.round(validDays * (weeklyRate / 7));
      }
    } else if (durationPlan === 'monthly') {
      const months = Math.floor(validDays / 30);
      const remDays = validDays % 30;
      if (months > 0) {
        return (months * monthlyRate) + (remDays * Math.round(monthlyRate / 30));
      } else {
        return Math.round(validDays * (monthlyRate / 30));
      }
    } else {
      return validDays * dailyRate;
    }
  };

  const totalCost = calculateTotalCost();
  const effectiveDailyRate = validDays > 0 ? Math.round(totalCost / validDays) : (vehicle ? vehicle.rate : 0);

  // Conflict detection logic
  const hasDateConflict = () => {
    if (!fromDate || !toDate || validDays <= 0) return false;
    const reqStart = new Date(fromDate);
    const reqEnd = new Date(toDate);

    return bookedDates.some(b => {
      const bStart = new Date(b.from);
      const bEnd = new Date(b.to);
      return reqStart <= bEnd && reqEnd >= bStart;
    });
  };

  const isConflict = hasDateConflict();

  const handleCalendarRangeSelect = (start, end) => {
    setFromDate(start);
    if (end) setToDate(end);
  };

  const handleRequestBooking = () => {
    setErr('');
    if (vehicle && !vehicle.available) {
      setErr("This vehicle is currently marked unavailable for booking.");
      return;
    }
    if (validDays <= 0) {
      setErr("Pick a return date that's after or same as pickup date.");
      return;
    }
    if (isConflict) {
      setErr("Conflict Alert: Selected dates overlap with an existing booking. Please pick alternative dates.");
      return;
    }
    if (!user || user.role !== 'customer') {
      setErr("Please sign in or register as a customer to place a booking request.");
      return;
    }

    const planLabel = durationPlan === 'weekly' ? ' (Weekly Plan)' : durationPlan === 'monthly' ? ' (Monthly Plan)' : '';

    onRequestConfirmation({
      kind: 'Confirm request',
      heading: `Send booking request?`,
      body: `${vehicle.name} (${vehicle.vehicleNumber || 'Plate Pending'}) in ${vehicle.city}, ${fromDate} (${pickupTime}) → ${toDate} (${returnTime}) (${validDays} day${validDays > 1 ? 's' : ''})${planLabel} for ₹${totalCost} total. This goes to the partner for approval — you won't be charged yet.`,
      confirmLabel: 'Send request',
      danger: false
    }, async () => {
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleId: vehicle.id || vehicle._id,
            vehicleName: vehicle.name,
            emoji: '',
            customerEmail: user.email,
            customerName: user.name,
            ownerEmail: vehicle.ownerEmail,
            from: fromDate,
            to: toDate,
            pickupTime,
            returnTime,
            durationPlan,
            city: vehicle.city,
            total: totalCost
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setErr(data.error || 'Failed to submit booking request.');
          return;
        }
        setBooking(data);
        setStep('receipt');
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleConfirmPayment = () => {
    setPayErr('');
    const card = payCard.trim();
    if (!card || !payExp.trim() || !payCvc.trim()) {
      setPayErr('Enter a card number, expiry, and CVC to continue.');
      return;
    }
    if (card.replace(/\s/g, '').length < 12) {
      setPayErr('That card number looks too short.');
      return;
    }

    const last4 = card.replace(/\s/g, '').slice(-4);

    onRequestConfirmation({
      kind: 'Confirm payment',
      heading: `Charge ₹${booking.total}?`,
      body: `Card ending in ${last4} will be charged for ${booking.vehicleName} (${booking.from} → ${booking.to}).`,
      confirmLabel: 'Confirm payment',
      danger: false
    }, async () => {
      try {
        const res = await fetch(`/api/bookings/${booking.id}/pay`, { method: 'PUT' });
        const data = await res.json();
        setBooking(data);
        setStep('receipt');
      } catch (e) {
        console.error(e);
      }
    });
  };

  if (!targetVehicle && !booking) return null;

  return (
    <div id="booking-screen" className="screen active" style={{ padding: '20px 0 60px' }}>
      <div className="container" style={{ maxWidth: '620px' }}>
        <button className="back-link" onClick={onBackToFleet}>
          <ArrowLeft size={16} /> Back to fleet
        </button>

        {/* STEP 1: BOOKING FORM */}
        {step === 'form' && vehicle && (
          <div className="booking-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div className="kind mono" style={{ fontSize: '.7rem', letterSpacing: '.12em', color: 'var(--amber)', textTransform: 'uppercase' }}>
                {vehicle.kind === 'car' ? '4W Vehicle' : '2W Vehicle'} · {vehicle.fuel}
              </div>
              {vehicle.vehicleNumber && (
                <span className="mono" style={{ fontSize: '0.78rem', background: 'rgba(255, 255, 255, 0.08)', padding: '2px 8px', borderRadius: '6px', color: '#FFFFFF' }}>
                  {vehicle.vehicleNumber}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.5rem', margin: '4px 0 16px', color: '#FFFFFF' }}>
              {vehicle.name} — {vehicle.tagline}
            </h2>

            {/* Duration Plan Picker */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--steel-soft)', marginBottom: '8px' }}>
                Select Rental Duration Plan
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={`filter-chip ${durationPlan === 'daily' ? 'active' : ''}`}
                  onClick={() => setDurationPlan('daily')}
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem', textAlign: 'center' }}
                >
                  Daily (₹{vehicle.rate}/d)
                </button>
                <button
                  type="button"
                  className={`filter-chip ${durationPlan === 'weekly' ? 'active' : ''}`}
                  onClick={() => setDurationPlan('weekly')}
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem', textAlign: 'center' }}
                >
                  Weekly (₹{vehicle.weeklyRate || Math.round(vehicle.rate * 6)}/wk)
                </button>
                <button
                  type="button"
                  className={`filter-chip ${durationPlan === 'monthly' ? 'active' : ''}`}
                  onClick={() => setDurationPlan('monthly')}
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem', textAlign: 'center' }}
                >
                  Monthly (₹{vehicle.monthlyRate || Math.round(vehicle.rate * 22)}/mo)
                </button>
              </div>
            </div>

            {/* Visual Calendar Component */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--steel-soft)', marginBottom: '8px' }}>
                Pick Rental Dates on Visual Calendar (Click Pickup & Return Dates)
              </label>
              <AvailabilityCalendar
                bookedRanges={bookedDates}
                startDate={fromDate}
                endDate={toDate}
                onSelectRange={handleCalendarRangeSelect}
              />
            </div>

            {/* Date & Time Pickers */}
            <div className="field-row">
              <div className="field">
                <label htmlFor="bk-from">Pickup Date</label>
                <input type="date" id="bk-from" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="bk-from-time">Pickup Time</label>
                <select id="bk-from-time" value={pickupTime} onChange={e => setPickupTime(e.target.value)}>
                  <option value="08:00">08:00 AM</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="18:00">06:00 PM</option>
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="bk-to">Return Date</label>
                <input type="date" id="bk-to" value={toDate} onChange={e => setToDate(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="bk-to-time">Return Time</label>
                <select id="bk-to-time" value={returnTime} onChange={e => setReturnTime(e.target.value)}>
                  <option value="09:00">09:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                  <option value="19:00">07:00 PM</option>
                  <option value="21:00">09:00 PM</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="bk-city">Pickup city</label>
              <input type="text" id="bk-city" value={vehicle.city} readOnly />
            </div>

            {/* Booked Dates Calendar / Conflict Alert */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--steel-soft)', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} color="var(--amber)" /> Booked Dates Calendar
              </div>
              {bookedDates.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: '#34D399' }}>✓ All dates available for this vehicle</div>
              ) : (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {bookedDates.map((b, i) => (
                    <span key={i} className="status-tag pending" style={{ fontSize: '0.72rem' }}>
                      Reserved: {b.from} → {b.to}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {isConflict && (
              <div className="err" style={{ display: 'block', marginBottom: '16px' }}>
                Conflict Alert: Your selected dates ({fromDate} → {toDate}) overlap with an existing booking. Please pick alternative dates!
              </div>
            )}

            {err && !isConflict && <div className="err" style={{ display: 'block' }}>{err}</div>}

            <div style={{ margin: '20px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px 0' }}>
              <div className="summary-row"><span>Base Daily Cost</span><span className="mono">₹{vehicle.rate} /day</span></div>
              <div className="summary-row"><span>Discounted Effective Cost</span><span className="mono" style={{ color: 'var(--amber)' }}>₹{effectiveDailyRate} /day</span></div>
              <div className="summary-row"><span>Duration</span><span className="mono">{validDays > 0 ? `${validDays} day${validDays > 1 ? 's' : ''}` : '—'}</span></div>
              <div className="summary-row total"><span>Total Cost</span><span className="mono" style={{ color: '#FFFFFF' }}>{validDays > 0 ? `₹${totalCost}` : '—'}</span></div>
            </div>

            <button
              className="btn btn-amber"
              disabled={isConflict || !vehicle.available}
              style={{ opacity: isConflict || !vehicle.available ? 0.5 : 1, cursor: isConflict || !vehicle.available ? 'not-allowed' : 'pointer' }}
              onClick={handleRequestBooking}
            >
              {isConflict ? 'Date Conflict Detected' : !vehicle.available ? 'Vehicle Unavailable' : 'Request Booking'}
            </button>
          </div>
        )}

        {/* STEP 2: PAYMENT */}
        {step === 'payment' && booking && (
          <div className="booking-card">
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 6px', color: '#FFFFFF' }}>Secure Checkout</h2>
            <p className="hint" style={{ marginBottom: '20px' }}>Demo payment portal — instant test confirmation.</p>

            <div className="field">
              <label htmlFor="pay-card">Card number</label>
              <input
                type="text"
                id="pay-card"
                placeholder="4242 4242 4242 4242"
                value={payCard}
                onChange={e => setPayCard(e.target.value)}
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="pay-exp">Expiry</label>
                <input
                  type="text"
                  id="pay-exp"
                  placeholder="MM/YY"
                  value={payExp}
                  onChange={e => setPayExp(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="pay-cvc">CVC</label>
                <input
                  type="text"
                  id="pay-cvc"
                  placeholder="123"
                  value={payCvc}
                  onChange={e => setPayCvc(e.target.value)}
                />
              </div>
            </div>

            {payErr && <div className="err" style={{ display: 'block' }}>{payErr}</div>}

            <div className="summary-row total" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '14px', paddingTop: '16px' }}>
              <span>Amount due</span>
              <span className="mono" style={{ color: 'var(--green)' }}>₹{booking.total}</span>
            </div>

            <button className="btn btn-green" style={{ marginTop: '18px' }} onClick={handleConfirmPayment}>
              <CreditCard size={18} /> Confirm & Pay ₹{booking.total}
            </button>
          </div>
        )}

        {/* STEP 3: RECEIPT */}
        {step === 'receipt' && booking && (
          <div className="booking-card receipt">
            <div className={`stamp ${booking.paymentStatus === 'paid' ? '' : 'pending'}`}>
              {booking.paymentStatus === 'paid' ? 'PAID & CONFIRMED' : 'REQUEST SENT'}
            </div>
            <h2 style={{ fontSize: '1.6rem', margin: '4px 0 2px', color: '#FFFFFF' }}>{booking.vehicleName}</h2>
            <div className="plate-num">{booking.id}</div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16px 20px', margin: '16px 0 20px', textAlign: 'left' }}>
              <div className="summary-row"><span>Renter Name</span><span className="mono" style={{ color: '#FFFFFF', fontWeight: 600 }}>{booking.customerName}</span></div>
              <div className="summary-row"><span>Renter Email</span><span className="mono">{booking.customerEmail}</span></div>
              <div className="summary-row"><span>Pickup Date & Time</span><span className="mono" style={{ color: 'var(--amber)', fontWeight: 700 }}>{booking.from} ({booking.pickupTime || '09:00'})</span></div>
              <div className="summary-row"><span>Return Date & Time</span><span className="mono" style={{ color: 'var(--amber)', fontWeight: 700 }}>{booking.to} ({booking.returnTime || '17:00'})</span></div>
              <div className="summary-row"><span>Pickup City</span><span className="mono">{booking.city}</span></div>
              <div className="summary-row"><span>Rental Duration Plan</span><span className="mono" style={{ textTransform: 'capitalize' }}>{booking.durationPlan || 'daily'}</span></div>
              <div className="summary-row total" style={{ paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span>Total Bill Amount</span>
                <span className="mono" style={{ color: 'var(--green)', fontSize: '1.3rem', fontWeight: 800 }}>₹{booking.total}</span>
              </div>
            </div>

            <p className="hint" style={{ marginTop: '16px', lineHeight: 1.6 }}>
              {booking.paymentStatus === 'paid'
                ? "Your booking is recorded and confirmed! You can view and manage this booking any time in your Customer Dashboard."
                : "Your booking request is recorded and dispatched to the rental partner for approval. Track live status from your dashboard."}
            </p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onBackToFleet}>
                Back to fleet
              </button>
              {onViewBookings && (
                <button className="btn btn-amber" style={{ flex: 1 }} onClick={onViewBookings}>
                  View in My Bookings
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
