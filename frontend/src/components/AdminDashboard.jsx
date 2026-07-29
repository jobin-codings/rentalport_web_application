import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ShieldCheck, Users, Car, Bike, Activity, MapPin, X, TrendingUp, AlertTriangle, Eye, Ban, UserCheck, Settings, Fuel, Tag } from 'lucide-react';
import AnalyticsChart from './AnalyticsChart';

export default function AdminDashboard({ onRequestConfirmation }) {
  const [adminTab, setAdminTab] = useState('bookings'); // 'bookings' | 'vehicles' | 'users' | 'partners' | 'cancelled'
  const [stats, setStats] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [partners, setPartners] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Detail Modal State
  const [activeModal, setActiveModal] = useState(null); // 'users' | 'partners' | 'active-rentals' | 'pending-vehicles' | 'revenue-graph' | null
  const [reviewVehicle, setReviewVehicle] = useState(null); // Vehicle object for detailed review modal
  const [viewUser, setViewUser] = useState(null); // User object for detailed user modal

  useEffect(() => {
    fetchAdminData();
    // Asynchronous background polling every 5 seconds
    const interval = setInterval(() => {
      fetchAdminData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      const sRes = await fetch('/api/admin/stats');
      if (sRes.ok) {
        const sData = await sRes.json();
        setStats(sData);
      }

      const bRes = await fetch('/api/admin/all-bookings');
      if (bRes.ok) {
        const bData = await bRes.json();
        setAllBookings(bData);
      }

      const vRes = await fetch('/api/vehicles');
      if (vRes.ok) {
        const vData = await vRes.json();
        setAllVehicles(vData);
      }

      const pRes = await fetch('/api/admin/partners');
      if (pRes.ok) {
        const pData = await pRes.json();
        setPartners(pData);
      }

      const uRes = await fetch('/api/admin/users');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUsersList(uData);
      }
    } catch (e) {
      console.error('Admin async poll error:', e);
    }
  };

  const handleApproveVehicle = (v) => {
    onRequestConfirmation({
      kind: 'Approve listing',
      heading: `Approve "${v.name}"?`,
      body: `This makes it visible and bookable by customers in ${v.city} at ₹${v.rate}/day.`,
      confirmLabel: 'Approve listing',
      danger: false
    }, async () => {
      try {
        await fetch(`/api/vehicles/${v.id || v._id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' })
        });
        setReviewVehicle(null);
        fetchAdminData();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleRejectVehicle = (v) => {
    onRequestConfirmation({
      kind: 'Reject listing',
      heading: `Reject "${v.name}"?`,
      body: `The partner's listing will stay hidden from customers until they edit and resubmit it.`,
      confirmLabel: 'Reject listing'
    }, async () => {
      try {
        await fetch(`/api/vehicles/${v.id || v._id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected' })
        });
        setReviewVehicle(null);
        fetchAdminData();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleToggleBlockUser = (u) => {
    const isCurrentlyBlocked = u.isBlocked || u.status === 'blocked';
    const actionLabel = isCurrentlyBlocked ? 'Unblock' : 'Block';
    
    onRequestConfirmation({
      kind: `${actionLabel} user`,
      heading: `${actionLabel} user account for ${u.name}?`,
      body: isCurrentlyBlocked
        ? `This will restore full system access for ${u.email}.`
        : `This will block ${u.email} from signing in or placing bookings until unblocked by an admin.`,
      confirmLabel: `${actionLabel} user`,
      danger: !isCurrentlyBlocked
    }, async () => {
      try {
        await fetch(`/api/admin/users/${u._id || u.email}/block`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isBlocked: !isCurrentlyBlocked })
        });
        setViewUser(null);
        fetchAdminData();
      } catch (e) {
        console.error(e);
      }
    });
  };

  // Prioritize pending vehicles left to get approval FIRST
  const sortedVehiclesForApproval = [...allVehicles].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return 0;
  });

  const cancelledBookings = allBookings.filter(b => b.status === 'cancelled');

  return (
    <div id="admin-dash" className="screen active" style={{ paddingBottom: '60px' }}>
      <div className="container">
        <div className="dash-head">
          <h1>RentalPort Admin Control Center</h1>
          <p>Platform analytics, partner oversight, vehicle moderation, user blocking, and booking history.</p>
        </div>

        {/* Interactive KPI Analytics Row */}
        {stats && (
          <div className="stat-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <div className="stat" style={{ cursor: 'pointer' }} onClick={() => setAdminTab('users')}>
              <div className="num" style={{ color: '#60A5FA' }}>{usersList.length || stats.registeredUsers}</div>
              <div className="lb">Registered Users (View)</div>
            </div>
            <div className="stat" style={{ cursor: 'pointer' }} onClick={() => setActiveModal('revenue-graph')}>
              <div className="num" style={{ color: '#34D399' }}>{stats.bookingConversionRate || 85}%</div>
              <div className="lb">Booking Conversion Rate</div>
            </div>
            <div className="stat" style={{ cursor: 'pointer' }} onClick={() => setActiveModal('active-rentals')}>
              <div className="num" style={{ color: 'var(--amber)' }}>{stats.vehicleUtilizationRate || 42}%</div>
              <div className="lb">Vehicle Utilization Rate</div>
            </div>
            <div className="stat" style={{ cursor: 'pointer' }}>
              <div className="num" style={{ color: '#FCA5A5' }}>{stats.bookingConflictRate || 4.5}%</div>
              <div className="lb">Booking Conflict Rate</div>
            </div>
            <div className="stat" style={{ cursor: 'pointer' }}>
              <div className="num" style={{ color: '#A78BFA' }}>{stats.averageRentalDuration || 3.5}d</div>
              <div className="lb">Avg Rental Duration</div>
            </div>
            <div className="stat" style={{ cursor: 'pointer' }} onClick={() => setActiveModal('revenue-graph')}>
              <div className="num" style={{ color: 'var(--green)' }}>₹{stats.totalRevenue}</div>
              <div className="lb">Platform Revenue (Graph)</div>
            </div>
          </div>
        )}

        {/* Dash-Tabs Class Div */}
        <div className="dash-tabs">
          <button className={`filter-chip ${adminTab === 'bookings' ? 'active' : ''}`} onClick={() => setAdminTab('bookings')}>
            All Bookings ({allBookings.length})
          </button>
          <button className={`filter-chip ${adminTab === 'vehicles' ? 'active' : ''}`} onClick={() => setAdminTab('vehicles')}>
            Vehicle Approvals ({allVehicles.filter(v => v.status === 'pending').length} Pending)
          </button>
          <button className={`filter-chip ${adminTab === 'users' ? 'active' : ''}`} onClick={() => setAdminTab('users')}>
            Users Management ({usersList.length})
          </button>
          <button className={`filter-chip ${adminTab === 'partners' ? 'active' : ''}`} onClick={() => setAdminTab('partners')}>
            Partners Directory ({partners.length})
          </button>
          <button className={`filter-chip ${adminTab === 'cancelled' ? 'active' : ''}`} onClick={() => setAdminTab('cancelled')}>
            Cancelled Details ({cancelledBookings.length})
          </button>
        </div>

        {/* TAB 1: ALL BOOKINGS TAB */}
        {adminTab === 'bookings' && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Vehicle</th>
                  <th>Customer</th>
                  <th>Partner Email</th>
                  <th>City</th>
                  <th>Dates</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map(b => {
                  const displayStatus = b.status === 'approved' && b.paymentStatus === 'paid' ? 'paid' : b.status;
                  return (
                    <tr key={b.id || b._id}>
                      <td className="mono">{b.id}</td>
                      <td>{b.vehicleName}</td>
                      <td>{b.customerName}</td>
                      <td className="mono">{b.ownerEmail}</td>
                      <td>{b.city}</td>
                      <td className="mono">{b.from} → {b.to}</td>
                      <td className="mono" style={{ color: '#FFFFFF', fontWeight: 700 }}>₹{b.total}</td>
                      <td><span className={`status-tag ${displayStatus}`}>{displayStatus}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {allBookings.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--steel-soft)', padding: '30px' }}>
                No bookings recorded on the platform yet.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VEHICLE APPROVALS TAB (Pending Listed First) */}
        {adminTab === 'vehicles' && (
          <div className="grid">
            {sortedVehiclesForApproval.map(v => {
              const isPending = v.status === 'pending';
              const statusLabel = isPending ? 'pending' : (v.available ? 'yes' : 'no');
              const statusText = isPending ? 'Pending Approval' : (v.available ? 'Approved & Available' : 'Booked Out');

              return (
                <div key={v.id || v._id} className="card" style={{ borderColor: isPending ? 'var(--amber)' : 'rgba(255,255,255,0.08)' }}>
                  <div className="card-media" style={{ background: v.bg, position: 'relative', overflow: 'hidden' }}>
                    <span className={`avail ${statusLabel}`} style={{ zIndex: 2 }}>{statusText}</span>
                    {v.image ? (
                      <img src={v.image} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      v.kind === 'car' ? <Car size={42} color="var(--amber)" /> : <Bike size={42} color="var(--amber)" />
                    )}
                  </div>
                  <div className="card-body">
                    <div className="kind">{v.kind === 'car' ? '4W Vehicle' : '2W Vehicle'}</div>
                    <h3>{v.name}</h3>
                    <div className="card-city"><MapPin size={14} /> {v.city} · Partner: {v.ownerEmail}</div>
                    <div className="card-price"><div className="price-meter">₹{v.rate}<small> /day</small></div></div>

                    <div className="card-actions" style={{ marginTop: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <button className="card-cta" style={{ flex: 1, borderColor: 'var(--amber)', color: 'var(--amber)', background: 'rgba(245, 158, 11, 0.1)' }} onClick={() => setReviewVehicle(v)}>
                        <Eye size={14} /> Inspect Details
                      </button>
                      {isPending && (
                        <>
                          <button className="card-cta" style={{ flex: 1, borderColor: 'var(--green)', color: '#34D399', background: 'rgba(16,185,129,0.1)' }} onClick={() => handleApproveVehicle(v)}>
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button className="card-cta" style={{ flex: 1, borderColor: 'var(--red)', color: '#FCA5A5', background: 'rgba(239,68,68,0.1)' }} onClick={() => handleRejectVehicle(v)}>
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: USERS MANAGEMENT TAB */}
        {adminTab === 'users' && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>City</th>
                  <th>License No.</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => {
                  const isBlocked = u.isBlocked || u.status === 'blocked';
                  return (
                    <tr key={u._id || u.email}>
                      <td style={{ color: '#FFFFFF', fontWeight: 600 }}>{u.name}</td>
                      <td className="mono">{u.email}</td>
                      <td>
                        <span className={`role-tag ${u.role}`} style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.city}</td>
                      <td className="mono">{u.license || '—'}</td>
                      <td>
                        <span className={`status-tag ${isBlocked ? 'rejected' : 'approved'}`}>
                          {isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setViewUser(u)}>
                            <Eye size={13} /> View
                          </button>
                          <button
                            className={`btn ${isBlocked ? 'btn-green' : 'btn-red'} btn-sm`}
                            onClick={() => handleToggleBlockUser(u)}
                          >
                            {isBlocked ? <UserCheck size={13} /> : <Ban size={13} />}
                            {isBlocked ? ' Unblock' : ' Block'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {usersList.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--steel-soft)', padding: '30px' }}>
                No users found in database.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PARTNERS TAB */}
        {adminTab === 'partners' && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Partner Name</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Vehicles Listed</th>
                  <th>Active Rentals</th>
                </tr>
              </thead>
              <tbody>
                {partners.map(p => {
                  const vCount = allVehicles.filter(v => v.ownerEmail === p.email).length;
                  const active = allBookings.filter(b => b.ownerEmail === p.email && b.status === 'approved').length;

                  return (
                    <tr key={p._id}>
                      <td style={{ color: '#FFFFFF', fontWeight: 600 }}>{p.name}</td>
                      <td className="mono">{p.email}</td>
                      <td>{p.city}</td>
                      <td><span className="mono" style={{ color: 'var(--amber)' }}>{vCount}</span></td>
                      <td><span className="mono" style={{ color: 'var(--green)' }}>{active}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: CANCELLED DETAILS TAB */}
        {adminTab === 'cancelled' && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Vehicle</th>
                  <th>Customer</th>
                  <th>Partner Email</th>
                  <th>City</th>
                  <th>Dates</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cancelledBookings.map(b => (
                  <tr key={b.id || b._id}>
                    <td className="mono">{b.id}</td>
                    <td>{b.vehicleName}</td>
                    <td>{b.customerName} ({b.customerEmail})</td>
                    <td className="mono">{b.ownerEmail}</td>
                    <td>{b.city}</td>
                    <td className="mono">{b.from} → {b.to}</td>
                    <td className="mono">₹{b.total}</td>
                    <td><span className="status-tag cancelled">Cancelled</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cancelledBookings.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--steel-soft)', padding: '30px' }}>
                No cancelled bookings on record.
              </div>
            )}
          </div>
        )}
      </div>

      {/* VEHICLE INSPECTION & REVIEW MODAL */}
      {reviewVehicle && (
        <div className="overlay active" style={{ zIndex: 120 }} onClick={() => setReviewVehicle(null)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-media" style={{ background: reviewVehicle.bg, height: '200px', position: 'relative', overflow: 'hidden' }}>
              <button className="modal-close" onClick={() => setReviewVehicle(null)}><X size={20} /></button>
              {reviewVehicle.image ? (
                <img src={reviewVehicle.image} alt={reviewVehicle.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                reviewVehicle.kind === 'car' ? <Car size={64} color="var(--amber)" /> : <Bike size={64} color="var(--amber)" />
              )}
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="kind">{reviewVehicle.kind === 'car' ? '4W Vehicle' : '2W Vehicle'}</span>
                <span className="mono" style={{ fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.08)', padding: '3px 10px', borderRadius: '6px', color: '#FFFFFF' }}>
                  Reg: {reviewVehicle.vehicleNumber || 'Reg Pending'}
                </span>
              </div>
              <h2 style={{ color: '#FFFFFF', marginBottom: '6px' }}>{reviewVehicle.name} — {reviewVehicle.tagline}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--steel-soft)', marginBottom: '16px' }}>
                Listing Owner / Partner: <b className="mono" style={{ color: '#FFFFFF' }}>{reviewVehicle.ownerEmail}</b>
              </p>

              <div className="spec-grid" style={{ marginBottom: '16px' }}>
                <div className="spec"><div className="label">City</div><div className="val">{reviewVehicle.city}</div></div>
                <div className="spec"><div className="label">Seats</div><div className="val">{reviewVehicle.seats}</div></div>
                <div className="spec"><div className="label">Transmission</div><div className="val">{reviewVehicle.transmission}</div></div>
                <div className="spec"><div className="label">Fuel</div><div className="val">{reviewVehicle.fuel}</div></div>
                <div className="spec"><div className="label">Daily Cost</div><div className="val" style={{ color: 'var(--amber)' }}>₹{reviewVehicle.rate}/day</div></div>
                <div className="spec"><div className="label">Weekly Cost</div><div className="val" style={{ color: '#34D399' }}>₹{reviewVehicle.weeklyRate || Math.round(reviewVehicle.rate * 6)}/wk</div></div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--steel-soft)', fontWeight: 700, marginBottom: '6px' }}>
                  Current Moderation & Availability Status
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <span className={`status-tag ${reviewVehicle.status}`}>{reviewVehicle.status}</span>
                  <span className={`status-tag ${reviewVehicle.available ? 'approved' : 'rejected'}`}>
                    {reviewVehicle.available ? 'Available' : 'Booked / Unavailable'}
                  </span>
                  {reviewVehicle.inMaintenance && <span className="status-tag pending">In Maintenance</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-green" onClick={() => handleApproveVehicle(reviewVehicle)}>
                  <CheckCircle2 size={16} /> Approve Listing
                </button>
                <button className="btn btn-red" onClick={() => handleRejectVehicle(reviewVehicle)}>
                  <XCircle size={16} /> Reject Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAILS & BLOCKING MODAL */}
      {viewUser && (
        <div className="overlay active" style={{ zIndex: 120 }} onClick={() => setViewUser(null)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>User Account Details</h2>
                <button className="modal-close" style={{ position: 'relative', top: 0, right: 0 }} onClick={() => setViewUser(null)}><X size={20} /></button>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '18px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', margin: 0 }}>{viewUser.name}</h3>
                    <span className="mono" style={{ fontSize: '0.85rem', color: 'var(--steel-soft)' }}>{viewUser.email}</span>
                  </div>
                  <span className={`status-tag ${(viewUser.isBlocked || viewUser.status === 'blocked') ? 'rejected' : 'approved'}`}>
                    {(viewUser.isBlocked || viewUser.status === 'blocked') ? 'Blocked' : 'Active'}
                  </span>
                </div>

                <div className="spec-grid" style={{ marginBottom: 0 }}>
                  <div className="spec"><div className="label">Account Role</div><div className="val">{viewUser.role}</div></div>
                  <div className="spec"><div className="label">Home City</div><div className="val">{viewUser.city || 'Austin'}</div></div>
                  <div className="spec"><div className="label">Driver's License</div><div className="val">{viewUser.license || 'N/A'}</div></div>
                  <div className="spec"><div className="label">User ID</div><div className="val mono" style={{ fontSize: '0.78rem' }}>{viewUser._id}</div></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setViewUser(null)}>
                  Close
                </button>
                <button
                  className={`btn ${(viewUser.isBlocked || viewUser.status === 'blocked') ? 'btn-green' : 'btn-red'}`}
                  onClick={() => handleToggleBlockUser(viewUser)}
                >
                  {(viewUser.isBlocked || viewUser.status === 'blocked') ? <UserCheck size={16} /> : <Ban size={16} />}
                  {(viewUser.isBlocked || viewUser.status === 'blocked') ? ' Unblock User Account' : ' Block User Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAT ROW INTERACTIVE DETAIL MODALS */}
      {activeModal === 'revenue-graph' && (
        <div className="overlay active" style={{ zIndex: 120 }} onClick={() => setActiveModal(null)}>
          <div className="modal" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>Platform Revenue Details</h2>
                <button className="modal-close" style={{ position: 'relative', top: 0, right: 0 }} onClick={() => setActiveModal(null)}><X size={20} /></button>
              </div>
              <AnalyticsChart title="Total Platform Revenue Overview" type="revenue" />
            </div>
          </div>
        </div>
      )}

      {/* Active Rentals Modal */}
      {activeModal === 'active-rentals' && (
        <div className="overlay active" style={{ zIndex: 120 }} onClick={() => setActiveModal(null)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>Active Rentals Overview</h2>
                <button className="modal-close" style={{ position: 'relative', top: 0, right: 0 }} onClick={() => setActiveModal(null)}><X size={20} /></button>
              </div>
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {allBookings.filter(b => b.status === 'approved').map(b => (
                  <div key={b.id || b._id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '12px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ color: '#FFFFFF', margin: 0 }}>{b.vehicleName} ({b.id})</h4>
                      <span className="mono" style={{ color: 'var(--green)', fontWeight: 700 }}>₹{b.total}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--steel-soft)', margin: '4px 0 0' }}>
                      Renter: {b.customerName} ({b.customerEmail}) · Dates: {b.from} → {b.to}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
