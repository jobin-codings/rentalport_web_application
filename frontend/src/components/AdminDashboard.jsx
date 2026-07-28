import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ShieldCheck, Users, Car, DollarSign, Activity, MapPin, X, TrendingUp, AlertTriangle } from 'lucide-react';
import AnalyticsChart from './AnalyticsChart';

export default function AdminDashboard({ onRequestConfirmation }) {
  const [adminTab, setAdminTab] = useState('bookings'); // 'bookings' | 'vehicles' | 'partners' | 'cancelled'
  const [stats, setStats] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [partners, setPartners] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Detail Modal State
  const [activeModal, setActiveModal] = useState(null); // 'customers' | 'partners' | 'active-rentals' | 'pending-vehicles' | 'revenue-graph' | null

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const sRes = await fetch('/api/admin/stats');
      const sData = await sRes.json();
      setStats(sData);

      const bRes = await fetch('/api/admin/all-bookings');
      const bData = await bRes.json();
      setAllBookings(bData);

      const vRes = await fetch('/api/vehicles');
      const vData = await vRes.json();
      setAllVehicles(vData);

      const pRes = await fetch('/api/admin/partners');
      const pData = await pRes.json();
      setPartners(pData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveVehicle = (v) => {
    onRequestConfirmation({
      kind: 'Approve listing',
      heading: `Approve "${v.name}"?`,
      body: `This makes it visible and bookable by customers in ${v.city} at $${v.rate}/day.`,
      confirmLabel: 'Approve listing',
      danger: false
    }, async () => {
      try {
        await fetch(`/api/vehicles/${v.id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' })
        });
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
        await fetch(`/api/vehicles/${v.id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected' })
        });
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
          <p>Platform analytics, partner oversight, vehicle moderation, and booking history.</p>
        </div>

        {/* Interactive KPI Analytics Row */}
        {stats && (
          <div className="stat-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <div className="stat" style={{ cursor: 'pointer' }} onClick={() => setActiveModal('customers')}>
              <div className="num" style={{ color: '#60A5FA' }}>{stats.registeredUsers || (stats.customersCount + stats.partnersCount + 1)}</div>
              <div className="lb">Registered Users</div>
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
              <div className="num" style={{ color: 'var(--green)' }}>${stats.totalRevenue}</div>
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
            Vehicle Approvals ({allVehicles.filter(v => v.status === 'pending').length} Left)
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
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map(b => {
                  const displayStatus = b.status === 'approved' && b.paymentStatus === 'paid' ? 'paid' : b.status;
                  return (
                    <tr key={b.id || b._id}>
                      <td className="mono">{b.id}</td>
                      <td>{b.emoji} {b.vehicleName}</td>
                      <td>{b.customerName}</td>
                      <td className="mono">{b.ownerEmail}</td>
                      <td>{b.city}</td>
                      <td className="mono">{b.from} → {b.to}</td>
                      <td className="mono" style={{ color: '#FFFFFF', fontWeight: 700 }}>${b.total}</td>
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
              const statusText = isPending ? '⚠️ Pending Approval' : (v.available ? 'Approved & Available' : 'Booked Out');

              return (
                <div key={v.id || v._id} className="card" style={{ borderColor: isPending ? 'var(--amber)' : 'rgba(255,255,255,0.08)' }}>
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
                    <div className="card-city"><MapPin size={14} /> {v.city} · Partner: {v.ownerEmail}</div>
                    <div className="card-price"><div className="price-meter">${v.rate}<small> /day</small></div></div>

                    {isPending ? (
                      <div className="card-actions">
                        <button className="card-cta" style={{ borderColor: 'var(--green)', color: '#34D399', background: 'rgba(16,185,129,0.1)' }} onClick={() => handleApproveVehicle(v)}>
                          <CheckCircle2 size={14} /> Approve Listing
                        </button>
                        <button className="card-cta" style={{ borderColor: 'var(--red)', color: '#FCA5A5', background: 'rgba(239,68,68,0.1)' }} onClick={() => handleRejectVehicle(v)}>
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <div className="hint" style={{ marginTop: '10px' }}>
                        Moderation Status: <b style={{ color: '#FFFFFF' }}>{v.status}</b>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: PARTNERS TAB */}
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

        {/* TAB 4: CANCELLED DETAILS TAB */}
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
                    <td>{b.emoji} {b.vehicleName}</td>
                    <td>{b.customerName} ({b.customerEmail})</td>
                    <td className="mono">{b.ownerEmail}</td>
                    <td>{b.city}</td>
                    <td className="mono">{b.from} → {b.to}</td>
                    <td className="mono">${b.total}</td>
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

      {/* STAT ROW INTERACTIVE DETAIL MODALS */}

      {/* Revenue Graph & Details Modal */}
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

      {/* Pending Vehicles Modal */}
      {activeModal === 'pending-vehicles' && (
        <div className="overlay active" style={{ zIndex: 120 }} onClick={() => setActiveModal(null)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>Vehicles Awaiting Admin Review</h2>
                <button className="modal-close" style={{ position: 'relative', top: 0, right: 0 }} onClick={() => setActiveModal(null)}><X size={20} /></button>
              </div>
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {allVehicles.filter(v => v.status === 'pending').map(v => (
                  <div key={v.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: '#FFFFFF', margin: 0 }}>{v.emoji} {v.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--steel-soft)', margin: '4px 0 0' }}>{v.city} · ${v.rate}/day · Partner: {v.ownerEmail}</p>
                    </div>
                    <button className="btn btn-green btn-sm" onClick={() => { setActiveModal(null); handleApproveVehicle(v); }}>
                      Approve
                    </button>
                  </div>
                ))}
                {allVehicles.filter(v => v.status === 'pending').length === 0 && (
                  <p style={{ color: '#34D399', textAlign: 'center', padding: '20px' }}>✓ All vehicle listings have been reviewed!</p>
                )}
              </div>
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
                  <div key={b.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '12px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ color: '#FFFFFF', margin: 0 }}>{b.emoji} {b.vehicleName} ({b.id})</h4>
                      <span className="mono" style={{ color: 'var(--green)', fontWeight: 700 }}>${b.total}</span>
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

      {/* Partners Modal */}
      {activeModal === 'partners' && (
        <div className="overlay active" style={{ zIndex: 120 }} onClick={() => setActiveModal(null)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>RentalPort Partners Directory</h2>
                <button className="modal-close" style={{ position: 'relative', top: 0, right: 0 }} onClick={() => setActiveModal(null)}><X size={20} /></button>
              </div>
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {partners.map(p => (
                  <div key={p._id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '12px', marginBottom: '10px' }}>
                    <h4 style={{ color: '#FFFFFF', margin: 0 }}>{p.name}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--steel-soft)', margin: '4px 0 0' }}>Email: {p.email} · City: {p.city}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customers Modal */}
      {activeModal === 'customers' && (
        <div className="overlay active" style={{ zIndex: 120 }} onClick={() => setActiveModal(null)}>
          <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2>Registered Customers Details</h2>
                <button className="modal-close" style={{ position: 'relative', top: 0, right: 0 }} onClick={() => setActiveModal(null)}><X size={20} /></button>
              </div>
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '12px', marginBottom: '10px' }}>
                  <h4 style={{ color: '#FFFFFF', margin: 0 }}>Jordan Rivera</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--steel-soft)', margin: '4px 0 0' }}>Email: jordan@example.com · City: Austin · License: DL-2381092</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
