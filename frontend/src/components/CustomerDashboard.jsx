import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, CreditCard, XCircle, Compass, Car, Bike } from 'lucide-react';

export default function CustomerDashboard({ user, onOpenPayment, onBrowseFleet, onRequestConfirmation }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (user) {
      fetchBookings();
      // Asynchronous background polling every 5 seconds
      const interval = setInterval(() => {
        fetchBookings();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`/api/bookings/my-bookings?customerEmail=${user.email}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Customer async poll error:', err);
    }
  };

  const handleCancelBooking = (booking) => {
    const wasPaid = booking.paymentStatus === 'paid';
    const targetId = booking.id || booking._id;
    onRequestConfirmation({
      kind: 'Cancel booking',
      heading: `Cancel ${booking.vehicleName}?`,
      body: `${booking.from} → ${booking.to} in ${booking.city}.` + (wasPaid
        ? ' This booking has already been paid — cancelling will release the vehicle dates and end the rental.'
        : ' Your request will be withdrawn and booked dates will become available again.'),
      confirmLabel: 'Cancel booking'
    }, async () => {
      try {
        const res = await fetch(`/api/bookings/${targetId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' })
        });
        if (res.ok) {
          fetchBookings();
        }
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <div id="customer-dash" className="screen active" style={{ paddingBottom: '60px' }}>
      <div className="container">
        <div className="dash-head">
          <h1>My Bookings</h1>
          <p>{user ? `Signed in as ${user.email}` : ''}</p>
        </div>

        {bookings.length === 0 ? (
          <div className="empty">
            <div className="display">No bookings yet</div>
            <p>Once you book a car or bike, it'll show up here.</p>
            <button className="btn btn-amber" style={{ maxWidth: '220px', margin: '20px auto 0' }} onClick={onBrowseFleet}>
              <Compass size={18} /> Browse the fleet
            </button>
          </div>
        ) : (
          <div className="list-block">
            {bookings.map(b => {
              const canCancel = b.status === 'pending' || b.status === 'approved';
              const canPay = b.status === 'approved' && b.paymentStatus === 'unpaid';
              const displayStatus = b.status === 'approved' && b.paymentStatus === 'paid' ? 'paid' : b.status;

              return (
                <div key={b.id || b._id} className="booking-item">
                  <div className="emoji" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', padding: '12px', borderRadius: '12px' }}>
                    <Car size={24} color="var(--amber)" />
                  </div>
                  <div className="info">
                    <h4>{b.vehicleName}</h4>
                    <div className="dates">{b.from} → {b.to} · {b.city}</div>
                    <div className="who">Booking ID: {b.id}</div>
                  </div>
                  <div className="mono" style={{ fontWeight: 700, fontSize: '1.2rem', color: '#FFFFFF' }}>₹{b.total}</div>
                  <span className={`status-tag ${displayStatus}`}>{displayStatus}</span>
                  <div className="row-actions">
                    {canPay && (
                      <button className="btn btn-green btn-sm" onClick={() => onOpenPayment(b)}>
                        <CreditCard size={14} /> Pay now
                      </button>
                    )}
                    {canCancel && (
                      <button className="btn btn-red btn-sm" onClick={() => handleCancelBooking(b)}>
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
