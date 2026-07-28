import React from 'react';
import { Car, Bike, ShieldCheck, UserCheck, LogIn, LogOut, Sparkles } from 'lucide-react';

export default function Navbar({ activeRole, setActiveRole, user, onOpenAuth, onLogout }) {
  return (
    <header className="navbar">
      <a href="#" className="nav-brand">
        <Car className="w-7 h-7 text-indigo-400" />
        <span>Drive<span style={{ color: 'var(--accent-secondary)' }}>Now</span></span>
        <span className="brand-badge">PRO</span>
      </a>

      <div className="nav-role-switcher">
        <button
          className={`role-btn ${activeRole === 'customer' ? 'active' : ''}`}
          onClick={() => setActiveRole('customer')}
        >
          <Car size={16} /> Customer View
        </button>
        <button
          className={`role-btn ${activeRole === 'agency' ? 'active' : ''}`}
          onClick={() => setActiveRole('agency')}
        >
          <UserCheck size={16} /> Agency Owner
        </button>
        <button
          className={`role-btn ${activeRole === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveRole('admin')}
        >
          <ShieldCheck size={16} /> Admin Portal
        </button>
      </div>

      <div className="nav-actions">
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user.role.toUpperCase()}
              </div>
            </div>
            <button className="btn-secondary" onClick={onLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button className="btn-primary" onClick={onOpenAuth}>
            <LogIn size={16} /> Login / Register
          </button>
        )}
      </div>
    </header>
  );
}
