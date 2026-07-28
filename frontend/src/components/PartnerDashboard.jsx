import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, XCircle, Trash2, Edit3, Car, DollarSign, Users, MapPin, Settings, Fuel, Clock, AlertCircle, X, TrendingUp } from 'lucide-react';
import AnalyticsChart from './AnalyticsChart';

export default function PartnerDashboard({ user, onRequestConfirmation }) {
  const [partnerTab, setPartnerTab] = useState('vehicles'); // 'vehicles' | 'bookings' | 'cancelled'
  const [myVehicles, setMyVehicles] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  
  // Interactive Stat Modals
  const [activePartnerModal, setActivePartnerModal] = useState(null); // 'listed' | 'pending' | 'active' | 'revenue' | null

  // Add / Edit vehicle modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  
  const [vfName, setVfName] = useState('');
  const [vfVehicleNumber, setVfVehicleNumber] = useState('');
  const [vfKind, setVfKind] = useState('car');
  const [vfTagline, setVfTagline] = useState('');
  const [vfCity, setVfCity] = useState(user ? user.city : 'Austin');
  const [vfRate, setVfRate] = useState('');
  const [vfWeeklyRate, setVfWeeklyRate] = useState('');
  const [vfMonthlyRate, setVfMonthlyRate] = useState('');
  const [vfSeats, setVfSeats] = useState('');
  const [vfTransmission, setVfTransmission] = useState('Automatic');
  const [vfFuel, setVfFuel] = useState('Petrol');
  const [vfImage, setVfImage] = useState('');
  const [vfErr, setVfErr] = useState('');

  useEffect(() => {
    if (user) fetchPartnerData();
  }, [user]);

  const fetchPartnerData = async () => {
    try {
      const vRes = await fetch(`/api/vehicles?ownerEmail=${user.email}`);
      const vData = await vRes.json();
      setMyVehicles(vData);

      const bRes = await fetch(`/api/bookings/partner-bookings?ownerEmail=${user.email}`);
      const bData = await bRes.json();
      setMyBookings(bData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenForm = (v) => {
    setEditingVehicleId(v ? v.id : null);
    setVfName(v ? v.name : '');
    setVfVehicleNumber(v ? (v.vehicleNumber || '') : '');
    setVfKind(v ? v.kind : 'car');
    setVfTagline(v ? v.tagline : '');
    setVfCity(v ? v.city : user.city || 'Austin');
    setVfRate(v ? v.rate : '');
    setVfWeeklyRate(v ? (v.weeklyRate || Math.round((v.rate || 30) * 6)) : '');
    setVfMonthlyRate(v ? (v.monthlyRate || Math.round((v.rate || 30) * 22)) : '');
    setVfSeats(v ? v.seats : '');
    setVfTransmission(v ? v.transmission : 'Automatic');
    setVfFuel(v ? v.fuel : 'Petrol');
    setVfImage(v ? v.image || '' : '');
    setVfErr('');
    setShowFormModal(true);
  };

  const handleToggleMaintenance = (v) => {
    const nextState = !v.inMaintenance;
    onRequestConfirmation({
      kind: 'Maintenance Block',
      heading: nextState ? `Block "${v.name}" for maintenance?` : `Unblock "${v.name}" for rent?`,
      body: nextState
        ? `This will temporarily mark ${v.name} (${v.vehicleNumber || 'Reg Pending'}) as in maintenance, hiding it from customer search until unblocked.`
        : `This will mark ${v.name} as available again for customer rentals.`,
      confirmLabel: nextState ? 'Block for maintenance' : 'Unblock vehicle',
      danger: false
    }, async () => {
      try {
        await fetch(`/api/vehicles/${v.id}/maintenance`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inMaintenance: nextState })
        });
        fetchPartnerData();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleSaveVehicle = (e) => {
    e?.preventDefault();
    setVfErr('');
    if (!vfName.trim() || !vfTagline.trim() || !vfCity.trim() || !vfRate || !vfSeats) {
      setVfErr('Fill in every required field before saving.');
      return;
    }

    const isEdit = !!editingVehicleId;
    onRequestConfirmation({
      kind: isEdit ? 'Confirm changes' : 'Confirm new listing',
      heading: isEdit ? `Save changes to "${vfName}"?` : `List "${vfName}" for rent?`,
      body: isEdit
        ? `${vfCity} · $${vfRate}/day · ${vfSeats} seats. Saving will send this listing back to the admin for re-approval before it's visible to customers again.`
        : `${vfCity} · $${vfRate}/day · ${vfSeats} seats. This listing goes to the admin for approval before customers can see or book it.`,
      confirmLabel: isEdit ? 'Save changes' : 'Submit listing',
      danger: false
    }, async () => {
      try {
        const payload = {
          name: vfName.trim(),
          vehicleNumber: vfVehicleNumber.trim() || `REG-${Math.floor(1000 + Math.random() * 9000)}`,
          kind: vfKind,
          tagline: vfTagline.trim(),
          city: vfCity.trim(),
          rate: Number(vfRate),
          weeklyRate: vfWeeklyRate ? Number(vfWeeklyRate) : Math.round(Number(vfRate) * 6),
          monthlyRate: vfMonthlyRate ? Number(vfMonthlyRate) : Math.round(Number(vfRate) * 22),
          seats: Number(vfSeats),
          transmission: vfTransmission,
          fuel: vfFuel,
          image: vfImage.trim(),
          ownerEmail: user.email
        };

        if (isEdit) {
          await fetch(`/api/vehicles/${editingVehicleId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          await fetch('/api/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
        setShowFormModal(false);
        fetchPartnerData();
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleRemoveVehicle = (v) => {
    onRequestConfirmation({
      kind: 'Remove vehicle',
      heading: `Remove "${v.name}"?`,
      body: `This takes ${v.name} out of the fleet permanently. Customers will no longer be able to find or book it. This can't be undone.`,
      confirmLabel: 'Remove vehicle'
    }, async () => {
      try {
        await fetch(`/api/vehicles/${v.id}`, { method: 'DELETE' });
        fetchPartnerData();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleGrantBooking = (b) => {
    onRequestConfirmation({
      kind: 'Grant booking',
      heading: `Grant this booking to ${b.customerName}?`,
      body: `${b.vehicleName} will be marked unavailable for ${b.from} → ${b.to} and the customer will be asked to pay $${b.total}.`,
      confirmLabel: 'Grant booking',
      danger: false
    }, async () => {
      try {
        await fetch(`/api/bookings/${b.id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' })
        });
        fetchPartnerData();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleDeclineBooking = (b) => {
    onRequestConfirmation({
      kind: 'Decline booking',
      heading: `Decline ${b.customerName}'s request?`,
      body: `${b.vehicleName} for ${b.from} → ${b.to}. The customer will see this booking as declined and won't be charged.`,
      confirmLabel: 'Decline booking'
    }, async () => {
      try {
        await fetch(`/api/bookings/${b.id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected' })
        });
        fetchPartnerData();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const pendingApprovals = myBookings.filter(b => b.status === 'pending').length;
  const activeRentals = myBookings.filter(b => b.status === 'approved').length;
  const cancelledRequests = myBookings.filter(b => b.status === 'cancelled').length;
  const totalRevenue = myBookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + b.total, 0);

  return (
    <div id="partner-dash" className="screen active" style={{ paddingBottom: '60px' }}>
      <div className="container">
        <div className="dash-head">
          <h1>Partner Dashboard</h1>
          <p>{user ? `Signed in as ${user.email} · ${user.city}` : ''}</p>
        </div>

        {/* Interactive Stat-Row Class Div */}
        <div className="stat-row">
          <div className="stat" style={{ cursor: 'pointer' }} onClick={() => setActivePartnerModal('listed')}>
            <div className="num" style={{ color: 'var(--amber)' }}>{myVehicles.length}</div>
            <div className="lb">Vehicles listed (View)</div>
          </div>
          <div className="stat" style={{ cursor: 'pointer' }} onClick={() => setActivePartnerModal('pending')}>
            <div className="num" style={{ color: '#FCA5A5' }}>{pendingApprovals}</div>
            <div className="lb">Awaiting decision (View)</div>
          </div>
          <div className="stat" style={{ cursor: 'pointer' }} onClick={() => setActivePartnerModal('active')}>
            <div className="num" style={{ color: '#34D399' }}>{activeRentals}</div>
            <div className="lb">Active rentals (View)</div>
          </div>
          <div className="stat" style={{ cursor: 'pointer' }} onClick={() => setActivePartnerModal('revenue')}>
            <div className="num" style={{ color: 'var(--green)' }}>${totalRevenue}</div>
            <div className="lb">Revenue graph & details</div>
          </div>
        </div>

        {/* Dash-Tabs Class Div */}
        <div className="dash-tabs">
          <button className={`filter-chip ${partnerTab === 'vehicles' ? 'active' : ''}`} onClick={() => setPartnerTab('vehicles')}>
            My vehicles ({myVehicles.length})
          </button>
          <button className={`filter-chip ${partnerTab === 'bookings' ? 'active' : ''}`} onClick={() => setPartnerTab('bookings')}>
            Booking requests ({pendingApprovals})
          </button>
          <button className={`filter-chip ${partnerTab === 'cancelled' ? 'active' : ''}`} onClick={() => setPartnerTab('cancelled')}>
            Cancelled requests ({cancelledRequests})
          </button>
        </div>

        {/* MY VEHICLES TAB */}
        {partnerTab === 'vehicles' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
              <button className="btn btn-amber" style={{ width: 'auto', padding: '11px 22px' }} onClick={() => handleOpenForm(null)}>
                <Plus size={16} /> Add a vehicle
              </button>
            </div>

            <div className="grid">
              {myVehicles.map(v => {
                const statusLabel = v.status === 'pending' ? 'pending' : (v.available ? 'yes' : 'no');
                const statusText = v.status === 'pending' ? 'Awaiting admin review' : (v.available ? 'Available' : 'Booked out');

                return (
                  <div key={v.id || v._id} className="card">
                    <div className="card-media" style={{ background: v.bg, position: 'relative', overflow: 'hidden' }}>
                      <span className={`avail ${statusLabel}`} style={{ zIndex: 2 }}>{statusText}</span>
                      {v.image ? (
                        <img src={v.image} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <span>{v.emoji}</span>
                      )}
                    </div>
                    <div className="card-body">
                      <div className="kind">{v.kind}</div>
                      <h3>{v.name}</h3>
                      <div className="card-city"><MapPin size={14} /> {v.city}</div>
                      <div className="card-meta">
                        <span><Users size={13} /> {v.seats}</span>
                        <span><Settings size={13} /> {v.transmission}</span>
                        <span><Fuel size={13} /> {v.fuel}</span>
                      </div>
                      <div className="card-price"><div className="price-meter">${v.rate}<small> /day</small></div></div>
                      <div className="card-actions">
                        <button className="card-cta" onClick={() => handleOpenForm(v)}>
                          <Edit3 size={14} /> Edit
                        </button>
                        <button className="card-cta" style={{ borderColor: v.inMaintenance ? 'var(--amber)' : 'rgba(255,255,255,0.2)', color: v.inMaintenance ? 'var(--amber)' : '#FFFFFF' }} onClick={() => handleToggleMaintenance(v)}>
                          {v.inMaintenance ? 'Unblock Maintenance' : 'Block Maintenance'}
                        </button>
                        <button className="card-cta" style={{ borderColor: 'var(--red)', color: '#FCA5A5' }} onClick={() => handleRemoveVehicle(v)}>
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {myVehicles.length === 0 && (
              <div className="empty">
                <div className="display">No vehicles listed yet</div>
                <p>Add your first car or bike to start renting it out.</p>
              </div>
            )}
          </div>
        )}

        {/* BOOKING REQUESTS TAB */}
        {partnerTab === 'bookings' && (
          <div>
            <div className="list-block">
              {myBookings.sort((a, b) => a.from < b.from ? 1 : -1).map(b => {
                const displayStatus = b.status === 'approved' && b.paymentStatus === 'paid' ? 'paid' : b.status;
                const isPending = b.status === 'pending';

                return (
                  <div key={b.id || b._id} className="booking-item">
                    <div className="emoji">{b.emoji}</div>
                    <div className="info">
                      <h4>{b.vehicleName}</h4>
                      <div className="dates">{b.from} ({b.pickupTime || '09:00'}) → {b.to} ({b.returnTime || '17:00'}) · {b.city}</div>
                      <div className="who">Customer: {b.customerName} ({b.customerEmail})</div>
                    </div>
                    <div className="mono" style={{ fontWeight: 700, fontSize: '1.2rem', color: '#FFFFFF' }}>${b.total}</div>
                    <span className={`status-tag ${displayStatus}`}>{displayStatus}</span>
                    <div className="row-actions">
                      {isPending && (
                        <>
                          <button className="btn btn-green btn-sm" onClick={() => handleGrantBooking(b)}>
                            <CheckCircle2 size={14} /> Grant
                          </button>
                          <button className="btn btn-red btn-sm" onClick={() => handleDeclineBooking(b)}>
                            <XCircle size={14} /> Decline
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {myBookings.length === 0 && (
              <div className="empty">
                <div className="display">No booking requests yet</div>
                <p>Requests from customers will show up here for you to approve or decline.</p>
              </div>
            )}
          </div>
        )}

        {/* CANCELLED REQUESTS TAB */}
        {partnerTab === 'cancelled' && (
          <div>
            <div className="list-block">
              {myBookings.filter(b => b.status === 'cancelled').map(b => (
                <div key={b.id || b._id} className="booking-item">
                  <div className="emoji">{b.emoji}</div>
                  <div className="info">
                    <h4>{b.vehicleName}</h4>
                    <div className="dates">{b.from} → {b.to} · {b.city}</div>
                    <div className="who">Customer: {b.customerName} ({b.customerEmail})</div>
                  </div>
                  <div className="mono" style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--steel-soft)' }}>${b.total}</div>
                  <span className="status-tag cancelled">Cancelled</span>
                </div>
              ))}
            </div>

            {myBookings.filter(b => b.status === 'cancelled').length === 0 && (
              <div className="empty">
                <div className="display">No cancelled requests</div>
                <p>Cancelled customer bookings will be listed here.</p>
              </div>
            )}
          </div>
        )}

        {/* REVENUE GRAPH MODAL */}
        {activePartnerModal === 'revenue' && (
          <div className="overlay active" style={{ zIndex: 120 }} onClick={() => setActivePartnerModal(null)}>
            <div className="modal" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
              <div className="modal-form">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2>Partner Revenue Analytics</h2>
                  <button className="modal-close" style={{ position: 'relative', top: 0, right: 0 }} onClick={() => setActivePartnerModal(null)}><X size={20} /></button>
                </div>
                <AnalyticsChart title="Your Monthly Rental Revenue" type="revenue" />
              </div>
            </div>
          </div>
        )}

        {/* ADD / EDIT VEHICLE MODAL */}
        {showFormModal && (
          <div className="overlay active" onClick={() => setShowFormModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-form">
                <h2>{editingVehicleId ? 'Edit vehicle' : 'Add a vehicle'}</h2>
                
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="vf-name">Vehicle Model & Name</label>
                    <input type="text" id="vf-name" placeholder="e.g. Civic Hatchback" value={vfName} onChange={e => setVfName(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="vf-number">Vehicle Registration Number</label>
                    <input type="text" id="vf-number" placeholder="e.g. REG-8829" value={vfVehicleNumber} onChange={e => setVfVehicleNumber(e.target.value)} />
                  </div>
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="vf-type">Type (2W / 4W)</label>
                    <select id="vf-type" value={vfKind} onChange={e => setVfKind(e.target.value)}>
                      <option value="car">4W — Car / SUV / Van</option>
                      <option value="bike">2W — Motorcycle / Scooter / Bike</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="vf-tagline">Tagline</label>
                    <input type="text" id="vf-tagline" placeholder="e.g. Executive sporty hatchback" value={vfTagline} onChange={e => setVfTagline(e.target.value)} />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="vf-image">Photo Image URL</label>
                  <input type="url" id="vf-image" placeholder="https://images.unsplash.com/photo-..." value={vfImage} onChange={e => setVfImage(e.target.value)} />
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="vf-city">City</label>
                    <input type="text" id="vf-city" placeholder="e.g. Austin" value={vfCity} onChange={e => setVfCity(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="vf-rate">Daily Rate ($)</label>
                    <input type="number" id="vf-rate" min="1" placeholder="42" value={vfRate} onChange={e => setVfRate(e.target.value)} />
                  </div>
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="vf-wrate">Weekly Rate ($)</label>
                    <input type="number" id="vf-wrate" min="1" placeholder="250" value={vfWeeklyRate} onChange={e => setVfWeeklyRate(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="vf-mrate">Monthly Rate ($)</label>
                    <input type="number" id="vf-mrate" min="1" placeholder="900" value={vfMonthlyRate} onChange={e => setVfMonthlyRate(e.target.value)} />
                  </div>
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="vf-seats">Seats</label>
                    <input type="number" id="vf-seats" min="1" placeholder="5" value={vfSeats} onChange={e => setVfSeats(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="vf-transmission">Transmission</label>
                    <select id="vf-transmission" value={vfTransmission} onChange={e => setVfTransmission(e.target.value)}>
                      <option>Automatic</option>
                      <option>Manual</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="vf-fuel">Fuel</label>
                  <select id="vf-fuel" value={vfFuel} onChange={e => setVfFuel(e.target.value)}>
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Electric</option>
                    <option>Hybrid</option>
                    <option>None</option>
                  </select>
                </div>

                {vfErr && <div className="err" style={{ display: 'block' }}>{vfErr}</div>}

                <button type="button" className="btn btn-amber" style={{ marginTop: '12px' }} onClick={handleSaveVehicle}>
                  Save vehicle
                </button>
                <p className="hint" style={{ textAlign: 'center', marginTop: '12px' }}>
                  New listings go to the admin for approval before they appear in search.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
