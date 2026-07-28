import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, CheckCircle2, Calendar, Shield, DollarSign, Clock, Tag, AlertCircle } from 'lucide-react';
import AvailabilityCalendar from './AvailabilityCalendar';

export default function BookingFlow({ vehicle, user, initialStep, initialBooking, onBackToFleet, onRequestConfirmation }) {
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

  // Active / Created Booking object
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
      const res = await fetch(`/api/bookings/vehicle-dates/${vehicle.id}`);
      if (res.ok) {
        const data = await res.json();
        setBookedDates(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const targetVehicle = vehicle || (booking ? { name: booking.vehicleName, city: booking.city } : null);

  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
  const validDays = diff > 0 ? diff : 0;

  // Flexible duration plan rate logic
  let effectiveDailyRate = vehicle ? vehicle.rate : 0;
  if (durationPlan === 'weekly' && vehicle?.weeklyRate) {
    effectiveDailyRate = Math.round(vehicle.weeklyRate / 7);
  } else if (durationPlan === 'weekly') {
    effectiveDailyRate = Math.round(effectiveDailyRate * 0.85); // 15% discount
  }

  if (durationPlan === 'monthly' && vehicle?.monthlyRate) {
    effectiveDailyRate = Math.round(vehicle.monthlyRate / 30);
  } else if (durationPlan === 'monthly') {
    effectiveDailyRate = Math.round(effectiveDailyRate * 0.65); // 35% discount
  }

  const totalCost = validDays && vehicle ? validDays * effectiveDailyRate : 0;

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
      setErr("Pick a return date that's after the pickup date.");
      return;
    }
    if (isConflict) {
      setErr("🚫 Conflict Alert: Selected dates overlap with an existing booking. Please pick alternative dates.");
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
      body: `${vehicle.name} (${vehicle.vehicleNumber || 'Plate Pending'}) in ${vehicle.city}, ${fromDate} (${pickupTime}) → ${toDate} (${returnTime}) (${validDays} day${validDays > 1 ? 's' : ''})${planLabel} for $${totalCost} total. This goes to the partner for approval — you won't be charged yet.`,
      confirmLabel: 'Send request',
      danger: false
    }, async () => {
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            emoji: vehicle.emoji,
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
      heading: `Charge $${booking.total}?`,
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
                {vehicle.kind === 'car' ? '🚘 4W Vehicle' : '🏍️ 2W Vehicle'} · {vehicle.fuel}
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
                  Daily (${vehicle.rate}/d)
                </button>
                <button
                  type="button"
                  className={`filter-chip ${durationPlan === 'weekly' ? 'active' : ''}`}
                  onClick={() => setDurationPlan('weekly')}
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem', textAlign: 'center' }}
                >
                  Weekly (${vehicle.weeklyRate || Math.round(vehicle.rate * 6)}/wk)
                </button>
                <button
                  type="button"
                  className={`filter-chip ${durationPlan === 'monthly' ? 'active' : ''}`}
                  onClick={() => setDurationPlan('monthly')}
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem', textAlign: 'center' }}
                >
                  Monthly (${vehicle.monthlyRate || Math.round(vehicle.rate * 22)}/mo)
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
                      🚫 Reserved: {b.from} → {b.to}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {isConflict && (
              <div className="err" style={{ display: 'block', marginBottom: '16px' }}>
                🚫 Conflict Alert: Your selected dates ({fromDate} → {toDate}) overlap with an existing booking. Please pick alternative dates!
              </div>
            )}

            {err && !isConflict && <div className="err" style={{ display: 'block' }}>{err}</div>}

            <div style={{ margin: '20px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px 0' }}>
              <div className="summary-row"><span>Base Daily Rate</span><span className="mono">${vehicle.rate} /day</span></div>
              <div className="summary-row"><span>Discounted Effective Rate</span><span className="mono" style={{ color: 'var(--amber)' }}>${effectiveDailyRate} /day</span></div>
              <div className="summary-row"><span>Duration</span><span className="mono">{validDays > 0 ? `${validDays} day${validDays > 1 ? 's' : ''}` : '—'}</span></div>
              <div className="summary-row total"><span>Total Cost</span><span className="mono" style={{ color: '#FFFFFF' }}>{validDays > 0 ? `$${totalCost}` : '—'}</span></div>
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
              <span className="mono" style={{ color: 'var(--green)' }}>${booking.total}</span>
            </div>

            <button className="btn btn-green" style={{ marginTop: '18px' }} onClick={handleConfirmPayment}>
              <CreditCard size={18} /> Confirm & Pay ${booking.total}
            </button>
          </div>
        )}

        {/* STEP 3: RECEIPT */}
        {step === 'receipt' && booking && (
          <div className="booking-card receipt">
            <div className={`stamp ${booking.paymentStatus === 'paid' ? '' : 'pending'}`}>
              {booking.paymentStatus === 'paid' ? 'PAID & CONFIRMED' : 'REQUEST SENT'}
            </div>
            <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#FFFFFF' }}>{booking.vehicleName}</h2>
            <div className="plate-num">{booking.id}</div>

            <div className="summary-row"><span>Pickup</span><span className="mono">{booking.from}</span></div>
            <div className="summary-row"><span>Return</span><span className="mono">{booking.to}</span></div>
            <div className="summary-row"><span>City</span><span className="mono">{booking.city}</span></div>
            <div className="summary-row total"><span>Total Paid</span><span className="mono">${booking.total}</span></div>

            <p className="hint" style={{ marginTop: '16px', lineHeight: 1.6 }}>
              {booking.paymentStatus === 'paid'
                ? "You're all set! Manage or view details for this booking any time from your Customer Dashboard."
                : "Your booking request has been dispatched to the partner for approval. Track status from your dashboard."}
            </p>

            <button className="btn btn-ghost" style={{ marginTop: '24px' }} onClick={onBackToFleet}>
              Back to fleet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
