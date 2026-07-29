import React from 'react';
import { TrendingUp, Activity, Award } from 'lucide-react';

export default function AnalyticsChart({ title, data = [], type = 'revenue' }) {
  // Demo dataset generator if data is small
  const chartPoints = data.length > 0 ? data : [
    { label: 'Jan', value: 42000, count: 18 },
    { label: 'Feb', value: 59000, count: 22 },
    { label: 'Mar', value: 78000, count: 28 },
    { label: 'Apr', value: 64000, count: 25 },
    { label: 'May', value: 96000, count: 34 },
    { label: 'Jun', value: 128000, count: 41 },
    { label: 'Jul', value: 112000, count: 38 }
  ];

  const maxValue = Math.max(...chartPoints.map(p => p.value), 100);

  return (
    <div className="analytics-card" style={{ background: 'rgba(19, 26, 41, 0.85)', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {type === 'revenue' ? <TrendingUp color="var(--green)" size={20} /> : <Activity color="var(--amber)" size={20} />}
            {title || 'Performance Analytics'}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--steel-soft)', margin: '4px 0 0' }}>
            Real-time vehicle utilization and revenue metrics
          </p>
        </div>
        <span className="pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.78rem' }}>
          <TrendingUp size={14} /> +24% vs last period
        </span>
      </div>

      {/* SVG Bar & Line Chart */}
      <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '14px', paddingTop: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        {chartPoints.map((pt, i) => {
          const barHeightPercent = Math.max(Math.round((pt.value / maxValue) * 100), 12);

          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--amber)', fontFamily: 'Roboto Mono, monospace', marginBottom: '6px', fontWeight: 700 }}>
                ₹{pt.value}
              </div>
              <div
                title={`${pt.label}: ₹${pt.value} (${pt.count} bookings)`}
                style={{
                  width: '100%',
                  maxWidth: '36px',
                  height: `${barHeightPercent}%`,
                  background: type === 'revenue' 
                    ? 'linear-gradient(180deg, #10B981 0%, #059669 100%)' 
                    : 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
                  borderRadius: '6px 6px 0 0',
                  boxShadow: type === 'revenue' ? '0 0 12px rgba(16, 185, 129, 0.3)' : '0 0 12px rgba(245, 158, 11, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              />
              <div style={{ fontSize: '0.78rem', color: 'var(--steel-soft)', marginTop: '8px', fontWeight: 600 }}>
                {pt.label}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.82rem', color: 'var(--steel-soft)' }}>
        <span>Total Fleet Bookings: <b style={{ color: '#FFFFFF' }}>{chartPoints.reduce((s, p) => s + (p.count || 0), 0)}</b></span>
        <span>Average Daily Cost: <b style={{ color: 'var(--amber)' }}>₹2,200</b></span>
      </div>
    </div>
  );
}
