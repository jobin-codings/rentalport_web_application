import React, { useState, useEffect } from 'react';
import { MapPin, Users, Settings, Fuel, Search, Sparkles, Car, Bike, Calendar, DollarSign, Filter, CheckCircle2 } from 'lucide-react';
import VehicleModal from './VehicleModal';

export default function FleetScreen({ onSelectVehicleForBooking }) {
  const [vehicles, setVehicles] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'car' | 'bike' | 'available'
  
  // Search parameters
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // '' | 'car' (4W) | 'bike' (2W)
  const [fuelFilter, setFuelFilter] = useState(''); // '' | 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'None'
  const [maxPrice, setMaxPrice] = useState(8000);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Selected vehicle for modal
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch('/api/vehicles?status=approved');
      const data = await res.json();
      setVehicles(data);
    } catch (err) {
      console.error(err);
    }
  };

  const citiesList = Array.from(new Set(vehicles.map(v => v.city))).filter(Boolean);

  const filteredVehicles = vehicles.filter(v => {
    if (v.status !== 'approved') return false;
    if (activeFilter === 'available' && (!v.available || v.inMaintenance)) return false;
    if (activeFilter === 'car' && v.kind !== 'car') return false;
    if (activeFilter === 'bike' && v.kind !== 'bike') return false;

    if (cityFilter && v.city !== cityFilter) return false;
    if (typeFilter && v.kind !== typeFilter) return false;
    if (fuelFilter && v.fuel !== fuelFilter) return false;
    if (v.rate > maxPrice) return false;
    return true;
  });

  const handleSearchBtn = () => {
    const fleetElem = document.querySelector('.fleet');
    if (fleetElem) fleetElem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="fleet-screen" className="screen active">
      <div className="hero">
        <div className="container">
          <div className="eyebrow">
            <Sparkles size={14} /> Instant Digital Vehicle Rentals
          </div>
          <h1>Find your perfect ride for today.</h1>
          <p>Rent cars (4W) and bikes (2W) on daily, weekly, or monthly plans across major cities.</p>

          <div className="search-bar">
            <div className="field">
              <label style={{ color: 'var(--steel-soft)' }} htmlFor="search-city">City</label>
              <select id="search-city" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
                <option value="">Any City</option>
                {citiesList.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label style={{ color: 'var(--steel-soft)' }} htmlFor="search-type">Vehicle Type (2W / 4W)</label>
              <select id="search-type" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">All Types (2W & 4W)</option>
                <option value="car">4W — Cars & Vans</option>
                <option value="bike">2W — Bikes & Scooters</option>
              </select>
            </div>
            <div className="field">
              <label style={{ color: 'var(--steel-soft)' }} htmlFor="search-fuel">Fuel Type</label>
              <select id="search-fuel" value={fuelFilter} onChange={e => setFuelFilter(e.target.value)}>
                <option value="">Any Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric (EV)</option>
                <option value="Hybrid">Hybrid</option>
                <option value="None">None (Bicycle)</option>
              </select>
            </div>
            <div className="field">
              <label style={{ color: 'var(--steel-soft)' }} htmlFor="search-from">Pickup Date</label>
              <input type="date" id="search-from" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
          </div>

          <div className="search-bar-row2">
            <div className="field">
              <label style={{ color: 'var(--steel-soft)', display: 'flex', justifyContent: 'space-between' }} htmlFor="search-price">
                <span>Max Daily Cost Limit</span>
                <span id="search-price-val" className="mono" style={{ color: 'var(--amber)', fontWeight: 700 }}>₹{maxPrice}/day</span>
              </label>
              <input
                type="range"
                id="search-price"
                min="200"
                max="10000"
                step="100"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                style={{ padding: 0, width: '100%', height: 'auto', marginTop: '6px' }}
              />
            </div>
            <div className="field">
              <label style={{ color: 'var(--steel-soft)' }} htmlFor="search-to">Return Date</label>
              <input type="date" id="search-to" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <button className="btn btn-amber" id="search-btn" onClick={handleSearchBtn}>
              <Search size={18} /> Search Fleet
            </button>
          </div>
        </div>
      </div>

      <div className="container fleet">
        <div className="fleet-head">
          <h2>Available Vehicles</h2>
          <span className="fleet-count mono">{filteredVehicles.length} vehicle{filteredVehicles.length === 1 ? '' : 's'}</span>
        </div>

        <div className="filters">
          <button className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
            All Fleet
          </button>
          <button className={`filter-chip ${activeFilter === 'car' ? 'active' : ''}`} onClick={() => setActiveFilter('car')}>
            4-Wheelers (Cars)
          </button>
          <button className={`filter-chip ${activeFilter === 'bike' ? 'active' : ''}`} onClick={() => setActiveFilter('bike')}>
            2-Wheelers (Bikes)
          </button>
          <button className={`filter-chip ${activeFilter === 'available' ? 'active' : ''}`} onClick={() => setActiveFilter('available')}>
            Available Now
          </button>
        </div>

        <div className="grid">
          {filteredVehicles.map(v => {
            const isAvail = v.available && !v.inMaintenance;
            const statusLabel = v.inMaintenance ? 'no' : (isAvail ? 'yes' : 'no');
            const statusText = v.inMaintenance ? 'In Maintenance' : (isAvail ? 'Available' : 'Booked Out');

            return (
              <div key={v.id} className="card">
                <div className="card-media" style={{ background: v.bg, position: 'relative', overflow: 'hidden' }}>
                  <span className={`avail ${statusLabel}`} style={{ zIndex: 2 }}>{statusText}</span>
                  {v.image ? (
                    <img
                      src={v.image}
                      alt={v.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    v.kind === 'car' ? <Car size={42} color="var(--amber)" /> : <Bike size={42} color="var(--amber)" />
                  )}
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="kind">{v.kind === 'car' ? '4W Vehicle' : '2W Vehicle'}</div>
                    {v.vehicleNumber && (
                      <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--steel-soft)' }}>
                        {v.vehicleNumber}
                      </span>
                    )}
                  </div>
                  <h3>{v.name}</h3>
                  <div className="card-city">
                    <MapPin size={14} color="var(--steel-soft)" /> {v.city}
                  </div>
                  <div className="card-meta">
                    <span><Users size={13} /> {v.seats} seat{v.seats > 1 ? 's' : ''}</span>
                    <span><Settings size={13} /> {v.transmission}</span>
                    <span><Fuel size={13} /> {v.fuel}</span>
                  </div>
                  <div className="card-price">
                    <div className="price-meter">₹{v.rate}<small> /day</small></div>
                  </div>
                  <button className="card-cta" onClick={() => setSelectedVehicle(v)}>
                    View details & calendar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="empty">
            <div className="display">Nothing matches that search</div>
            <p>Try a different city, type, or raise your price limit.</p>
          </div>
        )}
      </div>

      <VehicleModal
        vehicle={selectedVehicle}
        isOpen={!!selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        onBook={(v) => {
          setSelectedVehicle(null);
          onSelectVehicleForBooking(v);
        }}
      />

      <footer>PlateUp — modern vehicle rental platform. Demo app built with Node.js & React.</footer>
    </div>
  );
}
