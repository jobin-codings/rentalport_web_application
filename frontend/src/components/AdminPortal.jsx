import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Car, DollarSign, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AdminPortal({ setToast }) {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const aRes = await fetch('/api/admin/analytics');
      const aData = await aRes.json();
      setAnalytics(aData);

      const uRes = await fetch('/api/admin/users');
      const uData = await uRes.json();
      setUsers(uData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading system analytics...</div>;
  }

  const { kpis, recentBookings } = analytics;

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Super Admin Analytics & Control Hub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time KPIs, fleet utilization, conflict rate, total revenue, and user directory.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="analytics-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>FLEET UTILIZATION RATE</span>
            <Activity className="stat-icon" size={18} />
          </div>
          <div className="stat-value">{kpis.utilizationRate}%</div>
          <div className="stat-sub">Optimized active booked capacity</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>BOOKING CONVERSION RATE</span>
            <TrendingUp className="stat-icon" size={18} />
          </div>
          <div className="stat-value">{kpis.conversionRate}%</div>
          <div className="stat-sub">Approved / Total Booking Requests</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>BOOKING CONFLICT RATE</span>
            <AlertTriangle className="stat-icon" size={18} />
          </div>
          <div className="stat-value" style={{ color: '#34d399' }}>{kpis.conflictRate}%</div>
          <div className="stat-sub">Double-bookings prevented</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>TOTAL PLATFORM REVENUE</span>
            <DollarSign className="stat-icon" size={18} />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>${kpis.totalRevenue}</div>
          <div className="stat-sub">Gross rental earnings</div>
        </div>
      </div>

      {/* Breakdown Bar */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Vehicle Fleet Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>2-WHEELERS (2W)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>{kpis.count2W} Vehicles</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>4-WHEELERS (4W)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{kpis.count4W} Vehicles</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>TOTAL REGISTERED USERS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{users.length} Accounts</div>
          </div>
        </div>
      </div>

      {/* Registered Users Table */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>User & Agency Directory</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User / Agency Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    {u.agency_name && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Agency: {u.agency_name}</div>}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`status-pill ${u.role === 'admin' ? 'status-approved' : u.role === 'agency' ? 'badge-4w' : 'status-active'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{u.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
