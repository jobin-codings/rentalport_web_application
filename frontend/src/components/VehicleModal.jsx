import React, { useState, useEffect } from 'react';
import { X, MapPin, Users, Settings, Fuel, ArrowRight, Calendar, AlertCircle, ShieldCheck, Tag } from 'lucide-react';
import AvailabilityCalendar from './AvailabilityCalendar';

export default function VehicleModal({ vehicle, isOpen, onClose, onBook }) {
  const [bookedDates, setBookedDates] = useState([]);
  const [calStart, setCalStart] = useState('');
  const [calEnd, setCalEnd] = useState('');

  useEffect(() => {
    if (isOpen && vehicle) {
      fetchBookedDates();
    }
  }, [isOpen, vehicle]);

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

  if (!isOpen || !vehicle) return null;

  const canBook = vehicle.available && !vehicle.inMaintenance;

  // Rate calculations
  const dailyRate = vehicle.rate;
  const weeklyRate = vehicle.weeklyRate || Math.round(dailyRate * 6);
  const monthlyRate = vehicle.monthlyRate || Math.round(dailyRate * 22);

  return (
    <div className="overlay active" style={{ zIndex: 100 }} onClick={onClose}>
      <div className="modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        {/* Real Vehicle Media Header */}
        <div className="modal-media" style={{ background: vehicle.bg, overflow: 'hidden', position: 'relative', height: '220px' }}>
          <button className="modal-close" onClick={onClose} aria-label="Close modal" style={{ zIndex: 10 }}>
            <X size={20} />
          </button>
          {vehicle.image ? (
            <img
              src={vehicle.image}
              alt={vehicle.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <span>{vehicle.emoji}</span>
          )}
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div className="kind">{vehicle.kind === 'car' ? '🚘 4-Wheeler' : '🏍️ 2-Wheeler'}</div>
            {vehicle.vehicleNumber && (
              <span className="mono" style={{ fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.08)', padding: '2px 10px', borderRadius: '6px', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                Reg: {vehicle.vehicleNumber}
              </span>
            )}
          </div>
          <h2 style={{ color: '#FFFFFF', marginBottom: '8px' }}>{vehicle.name} — {vehicle.tagline}</h2>

          {vehicle.inMaintenance && (
            <div className="err" style={{ display: 'block', marginBottom: '14px' }}>
              🔧 Vehicle is currently undergoing scheduled maintenance. Bookings temporarily disabled by agency.
            </div>
          )}

          <div className="spec-grid" style={{ marginBottom: '16px' }}>
            <div className="spec">
              <div className="label">City</div>
              <div className="val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="var(--amber)" /> {vehicle.city}
              </div>
            </div>
            <div className="spec">
              <div className="label">Seats</div>
              <div className="val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={14} color="var(--amber)" /> {vehicle.seats}
              </div>
            </div>
            <div className="spec">
              <div className="label">Transmission</div>
              <div className="val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Settings size={14} color="var(--amber)" /> {vehicle.transmission}
              </div>
            </div>
            <div className="spec">
              <div className="label">Fuel</div>
              <div className="val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Fuel size={14} color="var(--amber)" /> {vehicle.fuel}
              </div>
            </div>
          </div>

          {/* Flexible Rental Rates Badge Bar */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 16px', marginBottom: '18px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--steel-soft)', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={13} color="var(--amber)" /> Flexible Rental Pricing Plans
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span className="pill" style={{ fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#FFFFFF' }}>
                Daily: <b className="mono" style={{ color: 'var(--amber)', marginLeft: '4px' }}>${dailyRate}/day</b>
              </span>
              <span className="pill" style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#FFFFFF' }}>
                Weekly Plan: <b className="mono" style={{ color: '#34D399', marginLeft: '4px' }}>${weeklyRate}/wk</b>
              </span>
              <span className="pill" style={{ fontSize: '0.8rem', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#FFFFFF' }}>
                Monthly Plan: <b className="mono" style={{ color: '#60A5FA', marginLeft: '4px' }}>${monthlyRate}/mo</b>
              </span>
            </div>
          </div>

          {/* Availability Calendar Month View */}
          <AvailabilityCalendar
            bookedRanges={bookedDates}
            startDate={calStart}
            endDate={calEnd}
            onSelectRange={(s, e) => { setCalStart(s); setCalEnd(e); }}
            isCompact={true}
          />

          <div className="modal-foot">
            <div>
              <div className="price-meter">
                ${dailyRate}<small style={{ fontSize: '.85rem', color: 'var(--steel-soft)', fontWeight: 400 }}> /day</small>
              </div>
            </div>
            <button
              className="btn btn-amber"
              style={{ width: 'auto', padding: '13px 26px', opacity: canBook ? 1 : 0.5, cursor: canBook ? 'pointer' : 'not-allowed' }}
              disabled={!canBook}
              onClick={() => onBook(vehicle)}
            >
              {canBook ? (
                <>Book this vehicle <ArrowRight size={16} /></>
              ) : (
                'Currently Unavailable'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
