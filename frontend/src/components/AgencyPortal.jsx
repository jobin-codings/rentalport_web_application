import React, { useState, useEffect } from 'react';
import { Car, Plus, CheckCircle, XCircle, Wrench, DollarSign, Calendar, AlertCircle } from 'lucide-react';

export default function AgencyPortal({ user, setToast }) {
  const [fleet, setFleet] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    brand: '',
    model: '',
    year: 2024,
    vehicle_type: '2W',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    registration_number: '',
    daily_rate: 45,
    weekly_rate: 260,
    monthly_rate: 900,
    location: 'San Francisco, CA',
    image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80'
  });

  useEffect(() => {
    fetchAgencyData();
  }, [user]);

  const fetchAgencyData = async () => {
    try {
      const agencyId = user ? user._id : 'usr_agency_1';
      
      const vRes = await fetch('/api/vehicles');
      const vData = await vRes.json();
      setFleet(vData.filter(v => v.owner_id === agencyId || agencyId === 'usr_agency_1'));

      const bRes = await fetch(`/api/bookings/agency-bookings?agency_id=${agencyId}`);
      const bData = await bRes.json();
      setBookings(bData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newVehicle,
          owner_id: user ? user._id : 'usr_agency_1',
          owner_name: user ? (user.agency_name || user.name) : 'Metro Fleet Agency'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add vehicle');

      setToast(`🚗 Added ${data.name} to your fleet successfully!`);
      setShowAddModal(false);
      fetchAgencyData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (vehicleId, currentStatus) => {
    const nextStatus = currentStatus === 'maintenance' ? 'available' : 'maintenance';
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setToast(`Status updated to ${nextStatus.toUpperCase()}`);
        fetchAgencyData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingAction = async (bookingId, status) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setToast(`Booking request ${status.toUpperCase()}!`);
        fetchAgencyData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingRequests = bookings.filter(b => b.status === 'pending');
  const activeRentals = bookings.filter(b => b.status === 'approved' || b.status === 'active');
  const totalRevenue = activeRentals.reduce((sum, b) => sum + (b.total_price || 0), 0);

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Rental Agency Management Console</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage fleet inventory, set daily/weekly/monthly rates, approve bookings, and block maintenance.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Vehicle to Fleet
        </button>
      </div>

      {/* Agency KPI Stats */}
      <div className="analytics-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>TOTAL FLEET</span>
            <Car className="stat-icon" size={18} />
          </div>
          <div className="stat-value">{fleet.length}</div>
          <div className="stat-sub">
            {fleet.filter(v => v.vehicle_type === '2W').length} 2-Wheelers • {fleet.filter(v => v.vehicle_type === '4W').length} 4-Wheelers
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>PENDING REQUESTS</span>
            <Calendar className="stat-icon" size={18} />
          </div>
          <div className="stat-value">{pendingRequests.length}</div>
          <div className="stat-sub" style={{ color: 'var(--accent-amber)' }}>
            Requires agency review
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>ACTIVE RENTALS</span>
            <CheckCircle className="stat-icon" size={18} />
          </div>
          <div className="stat-value">{activeRentals.length}</div>
          <div className="stat-sub">Vehicles currently on road</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>TOTAL AGENCY EARNINGS</span>
            <DollarSign className="stat-icon" size={18} />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>${totalRevenue}</div>
          <div className="stat-sub">Processed bookings</div>
        </div>
      </div>

      {/* Pending Booking Requests Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} style={{ color: 'var(--accent-amber)' }} /> Pending Booking Requests ({pendingRequests.length})
        </h3>

        {pendingRequests.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No pending booking approvals right now.
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle Requested</th>
                  <th>Customer</th>
                  <th>Dates</th>
                  <th>Total Cost</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map(b => (
                  <tr key={b._id}>
                    <td><b>{b.vehicle_name}</b></td>
                    <td>{b.customer_name} ({b.customer_email})</td>
                    <td>{new Date(b.start_date).toLocaleDateString()} - {new Date(b.end_date).toLocaleDateString()} ({b.total_days} days)</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>${b.total_price}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => handleBookingAction(b._id, 'approved')}
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: '#f87171' }}
                          onClick={() => handleBookingAction(b._id, 'rejected')}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fleet Inventory Management */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Fleet Inventory Management</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle Name</th>
                <th>Type</th>
                <th>Daily Rate</th>
                <th>Weekly Rate</th>
                <th>Monthly Rate</th>
                <th>Status</th>
                <th>Maintenance Toggle</th>
              </tr>
            </thead>
            <tbody>
              {fleet.map(v => (
                <tr key={v._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={v.image_url} alt="" style={{ width: '45px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{v.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reg: {v.registration_number}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${v.vehicle_type === '2W' ? 'badge-2w' : 'badge-4w'}`}>
                      {v.vehicle_type}
                    </span>
                  </td>
                  <td>${v.daily_rate}/day</td>
                  <td>${v.weekly_rate}/wk</td>
                  <td>${v.monthly_rate}/mo</td>
                  <td>
                    <span className={`status-pill status-${v.status}`}>
                      {v.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => handleUpdateStatus(v._id, v.status)}
                    >
                      <Wrench size={14} /> {v.status === 'maintenance' ? 'Set Available' : 'Block Maintenance'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Add New Vehicle Listing</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="search-field">
                <label>Vehicle Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vespa Primavera / Tesla Model 3"
                  value={newVehicle.name}
                  onChange={e => setNewVehicle({ ...newVehicle, name: e.target.value })}
                  required
                />
              </div>

              <div className="search-field">
                <label>Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Vespa / Tesla"
                  value={newVehicle.brand}
                  onChange={e => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                  required
                />
              </div>

              <div className="search-field">
                <label>Vehicle Category</label>
                <select
                  value={newVehicle.vehicle_type}
                  onChange={e => setNewVehicle({ ...newVehicle, vehicle_type: e.target.value })}
                >
                  <option value="2W">2-Wheeler (Scooter / Motorcycle)</option>
                  <option value="4W">4-Wheeler (Sedan / SUV / EV)</option>
                </select>
              </div>

              <div className="search-field">
                <label>Fuel Type</label>
                <select
                  value={newVehicle.fuel_type}
                  onChange={e => setNewVehicle({ ...newVehicle, fuel_type: e.target.value })}
                >
                  <option value="Petrol">Petrol</option>
                  <option value="EV">Electric (EV)</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="search-field">
                <label>Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g. 2W-VS-9910"
                  value={newVehicle.registration_number}
                  onChange={e => setNewVehicle({ ...newVehicle, registration_number: e.target.value })}
                  required
                />
              </div>

              <div className="search-field">
                <label>Daily Rental Rate ($)</label>
                <input
                  type="number"
                  value={newVehicle.daily_rate}
                  onChange={e => setNewVehicle({ ...newVehicle, daily_rate: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="search-field">
                <label>Weekly Rate ($)</label>
                <input
                  type="number"
                  value={newVehicle.weekly_rate}
                  onChange={e => setNewVehicle({ ...newVehicle, weekly_rate: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="search-field">
                <label>Monthly Rate ($)</label>
                <input
                  type="number"
                  value={newVehicle.monthly_rate}
                  onChange={e => setNewVehicle({ ...newVehicle, monthly_rate: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="search-field" style={{ gridColumn: '1 / -1' }}>
                <label>Image URL</label>
                <input
                  type="url"
                  value={newVehicle.image_url}
                  onChange={e => setNewVehicle({ ...newVehicle, image_url: e.target.value })}
                  required
                />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  Submit Vehicle Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
