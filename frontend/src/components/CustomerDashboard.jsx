import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, CreditCard, XCircle, Compass } from 'lucide-react';

export default function CustomerDashboard({ user, onOpenPayment, onBrowseFleet, onRequestConfirmation }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`/api/bookings/my-bookings?customerEmail=${user.email}`);
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelBooking = (booking) => {
    const wasPaid = booking.paymentStatus === 'paid';
    onRequestConfirmation({
      kind: 'Cancel booking',
      heading: `Cancel ${booking.vehicleName}?`,
      body: `${booking.from} → ${booking.to} in ${booking.city}.` + (wasPaid
        ? ' This booking has already been paid — cancelling will release the vehicle and end the rental.'
        : ' Your request will be withdrawn.'),
      confirmLabel: 'Cancel booking'
    }, async () => {
      try {
        await fetch(`/api/bookings/${booking.id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' })
        });
        fetchBookings();
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
                  <div className="emoji">{b.emoji}</div>
                  <div className="info">
                    <h4>{b.vehicleName}</h4>
                    <div className="dates">{b.from} → {b.to} · {b.city}</div>
                    <div className="who">Booking ID: {b.id}</div>
                  </div>
                  <div className="mono" style={{ fontWeight: 700, fontSize: '1.2rem', color: '#FFFFFF' }}>${b.total}</div>
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
