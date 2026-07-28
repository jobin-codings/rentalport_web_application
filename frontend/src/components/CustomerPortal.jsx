import React, { useState, useEffect } from 'react';
import { Search, Filter, Car, Bike, Zap, Fuel, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';
import BookingModal from './BookingModal';

export default function CustomerPortal({ user, onRequireAuth, setToast }) {
  const [vehicles, setVehicles] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my-bookings'
  
  // Filters
  const [vehicleType, setVehicleType] = useState('All');
  const [fuelType, setFuelType] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(300);

  // Booking Modal
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchVehicles();
    fetchMyBookings();
  }, [vehicleType, fuelType, locationFilter]);

  const fetchVehicles = async () => {
    try {
      let url = `/api/vehicles?vehicle_type=${vehicleType}&fuel_type=${fuelType}`;
      if (locationFilter !== 'All Locations') {
        url += `&location=${encodeURIComponent(locationFilter)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setVehicles(data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const custId = user ? user._id : 'usr_customer_1';
      const res = await fetch(`/api/bookings/my-bookings?customer_id=${custId}`);
      const data = await res.json();
      setMyBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    if (v.daily_rate > maxPrice) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return v.name.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q) || v.location.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenBooking = (vehicle) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    setSelectedVehicle(vehicle);
  };

  const handleBookingSuccess = (booking) => {
    setToast(`🎉 Booking request submitted successfully for ${booking.vehicle_name}!`);
    fetchMyBookings();
  };

  return (
    <div>
      {/* View Selector Tabs */}
      <div className="section-header">
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className={`btn-${activeTab === 'browse' ? 'primary' : 'secondary'}`}
            onClick={() => setActiveTab('browse')}
          >
            <Car size={16} /> Browse Vehicle Fleet
          </button>
          <button
            className={`btn-${activeTab === 'my-bookings' ? 'primary' : 'secondary'}`}
            onClick={() => setActiveTab('my-bookings')}
          >
            <Clock size={16} /> My Bookings ({myBookings.length})
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <>
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <h1>Rent Premium 2-Wheelers & 4-Wheelers On Demand</h1>
              <p>
                Real-time vehicle availability tracking, flexible daily/weekly/monthly rates, and instant digital booking.
              </p>

              {/* Quick Search Card */}
              <div className="search-card">
                <div className="search-field">
                  <label>Vehicle Category</label>
                  <select value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
                    <option value="All">All Vehicles (2W & 4W)</option>
                    <option value="2W">2-Wheeler (Scooters & Motorcycles)</option>
                    <option value="4W">4-Wheeler (Sedans, SUVs, EVs)</option>
                  </select>
                </div>

                <div className="search-field">
                  <label>Fuel Type</label>
                  <select value={fuelType} onChange={e => setFuelType(e.target.value)}>
                    <option value="All">All Fuel Types</option>
                    <option value="EV">Electric (EV)</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                  </select>
                </div>

                <div className="search-field">
                  <label>City Location</label>
                  <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
                    <option value="All Locations">All Cities</option>
                    <option value="San Francisco, CA">San Francisco, CA</option>
                    <option value="Los Angeles, CA">Los Angeles, CA</option>
                    <option value="New York, NY">New York, NY</option>
                  </select>
                </div>

                <div className="search-field">
                  <label>Max Daily Rate (${maxPrice})</label>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    step="10"
                    value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Catalog Filter Bar */}
          <div className="section-header">
            <div>
              <h2 className="section-title">Available Rental Fleet</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Showing {filteredVehicles.length} vehicles matching your criteria
              </p>
            </div>

            <div className="filter-pills">
              <button
                className={`filter-pill ${vehicleType === 'All' ? 'active' : ''}`}
                onClick={() => setVehicleType('All')}
              >
                All Fleet
              </button>
              <button
                className={`filter-pill ${vehicleType === '2W' ? 'active' : ''}`}
                onClick={() => setVehicleType('2W')}
              >
                🏍️ 2-Wheelers
              </button>
              <button
                className={`filter-pill ${vehicleType === '4W' ? 'active' : ''}`}
                onClick={() => setVehicleType('4W')}
              >
                🚗 4-Wheelers
              </button>
              <button
                className={`filter-pill ${fuelType === 'EV' ? 'active' : ''}`}
                onClick={() => setFuelType(fuelType === 'EV' ? 'All' : 'EV')}
              >
                ⚡ Electric (EV)
              </button>
            </div>
          </div>

          {/* Vehicle Grid */}
          <div className="vehicle-grid">
            {filteredVehicles.map(vehicle => (
              <div key={vehicle._id} className="vehicle-card">
                <div className="card-img-container">
                  <img src={vehicle.image_url} alt={vehicle.name} />
                  <span className={`card-badge ${vehicle.vehicle_type === '2W' ? 'badge-2w' : 'badge-4w'}`}>
                    {vehicle.vehicle_type === '2W' ? '2-Wheeler' : '4-Wheeler'}
                  </span>
                  {vehicle.fuel_type === 'EV' && (
                    <span className="badge-ev">
                      ⚡ EV
                    </span>
                  )}
                </div>

                <div className="card-body">
                  <h3 className="card-title">{vehicle.name}</h3>
                  <div className="card-meta">
                    <span>{vehicle.brand}</span> • <span>{vehicle.year}</span> • 
                    <span style={{ color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <MapPin size={12} /> {vehicle.location}
                    </span>
                  </div>

                  <div className="card-specs">
                    <div>⛽ <b>Fuel:</b> {vehicle.fuel_type}</div>
                    <div>⚙️ <b>Trans:</b> {vehicle.transmission}</div>
                    <div>👥 <b>Capacity:</b> {vehicle.seating_capacity} Seats</div>
                    <div>⚡ <b>Range/Mil:</b> {vehicle.specs ? vehicle.specs.mileage : '35 mpg'}</div>
                  </div>

                  <div className="card-footer">
                    <div className="price-tag">
                      <span className="price-amount">${vehicle.daily_rate}</span>
                      <span className="price-unit">/ day (wk: ${vehicle.weekly_rate})</span>
                    </div>

                    <button className="btn-primary" onClick={() => handleOpenBooking(vehicle)}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* My Bookings Tab */
        <div style={{ marginTop: '1rem' }}>
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>My Booking History</h2>
          
          {myBookings.length === 0 ? (
            <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Clock size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--accent-primary)' }} />
              <h3>No bookings found yet</h3>
              <p style={{ marginTop: '0.5rem' }}>Browse our fleet and place your first vehicle rental request!</p>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Dates</th>
                    <th>Duration</th>
                    <th>Total Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.map(b => (
                    <tr key={b._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {b.vehicle_image && (
                            <img src={b.vehicle_image} alt="" style={{ width: '45px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 600 }}>{b.vehicle_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {b._id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          {new Date(b.start_date).toLocaleDateString()} to {new Date(b.end_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td>{b.total_days} Days ({b.rental_duration_type})</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>${b.total_price}</td>
                      <td>
                        <span className={`status-pill status-${b.status}`}>
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {selectedVehicle && (
        <BookingModal
          vehicle={selectedVehicle}
          user={user}
          isOpen={!!selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
