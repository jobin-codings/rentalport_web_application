import React, { useState, useEffect } from 'react';
import { Car, User, LogOut, LogIn, Compass, LayoutDashboard, Shield, KeyRound, Sparkles, Home, Info, PhoneCall, X, Send, MapPin, Mail, Phone, CheckCircle2 } from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import FleetScreen from './components/FleetScreen';
import BookingFlow from './components/BookingFlow';
import CustomerDashboard from './components/CustomerDashboard';
import PartnerDashboard from './components/PartnerDashboard';
import AdminDashboard from './components/AdminDashboard';
import ConfirmationModal from './components/ConfirmationModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeScreen, setActiveScreen] = useState('fleet'); // 'fleet' (default home) | 'auth' | 'booking' | 'customer-dash' | 'partner-dash' | 'admin-dash'

  // Nav Modals
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Booking Flow parameters
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bookingStep, setBookingStep] = useState('form');
  const [activeBooking, setActiveBooking] = useState(null);

  // Confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOpts, setConfirmOpts] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('plateup_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.email) {
          handleEnterApp(parsed);
        }
      } catch (e) {}
    }
  }, []);

  const handleEnterApp = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('plateup_user', JSON.stringify(user));
    }

    if (user && user.role === 'partner') {
      setActiveScreen('partner-dash');
    } else if (user && user.role === 'admin') {
      setActiveScreen('admin-dash');
    } else {
      setActiveScreen('fleet');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('plateup_user');
    setActiveScreen('fleet');
  };

  const handleStartBooking = (vehicle) => {
    setSelectedVehicle(vehicle);
    setBookingStep('form');
    setActiveBooking(null);

    if (!currentUser) {
      // Require Sign In before proceeding to checkout
      setActiveScreen('auth');
    } else {
      setActiveScreen('booking');
    }
  };

  const handleOpenPayment = (booking) => {
    setActiveBooking(booking);
    setBookingStep('payment');
    setActiveScreen('booking');
  };

  const handleSendContact = (e) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setShowContactModal(false);
    }, 2000);
  };

  const requestConfirmation = (opts, action) => {
    setConfirmOpts(opts);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  const handleConfirmProceed = () => {
    setConfirmOpen(false);
    if (confirmAction) confirmAction();
    setConfirmAction(null);
  };

  return (
    <div className="app-root">
      {/* TOPBAR HEADER - Desktop full view & Streamlined mobile view */}
      <header className="topbar">
        <div className="nav-left-wrap" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            className="brand"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveScreen('fleet')}
          >
            <span className="dot"></span>RentalPort
          </div>

          {/* Navigation Links */}
          <button className={`pill ${activeScreen === 'fleet' ? 'active' : ''}`} onClick={() => setActiveScreen('fleet')}>
            <Home size={14} /> Home
          </button>
          <button className="pill desktop-only" onClick={() => setShowAboutModal(true)}>
            <Info size={14} /> About Us
          </button>
          <button className="pill desktop-only" onClick={() => setShowContactModal(true)}>
            <PhoneCall size={14} /> Contact Us
          </button>
          {!currentUser && (
            <button className="pill desktop-only" onClick={() => setActiveScreen('auth')}>
              <LogIn size={14} /> Sign In
            </button>
          )}
        </div>

        <div className="nav-right">
          {currentUser && (
            <span className={`role-tag ${currentUser.role} desktop-only`}>
              {currentUser.role}
            </span>
          )}

          {currentUser && (
            <span className="pill desktop-only">
              <User size={14} /> Hi, {currentUser.name.split(' ')[0]}
            </span>
          )}

          {currentUser && (
            <button
              className="pill"
              onClick={() => {
                if (currentUser.role === 'customer') setActiveScreen('customer-dash');
                else if (currentUser.role === 'partner') setActiveScreen('partner-dash');
                else if (currentUser.role === 'admin') setActiveScreen('admin-dash');
              }}
            >
              <LayoutDashboard size={14} />
              <span className="desktop-only">
                {currentUser.role === 'admin' ? 'Admin dashboard' : currentUser.role === 'partner' ? 'Partner dashboard' : 'My bookings'}
              </span>
              <span className="mobile-only">
                {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'partner' ? 'Fleet' : 'Bookings'}
              </span>
            </button>
          )}

          {currentUser ? (
            <button className="pill solid" onClick={handleLogout}>
              <LogOut size={14} /> <span className="desktop-only">Log out</span>
            </button>
          ) : (
            <button className="pill solid mobile-only" onClick={() => setActiveScreen('auth')}>
              <LogIn size={14} /> Sign In
            </button>
          )}
        </div>
      </header>

      {/* SCREEN ROUTER */}
      <main className="main-wrap">
        {activeScreen === 'auth' && (
          <AuthScreen onEnterApp={handleEnterApp} onCancel={() => setActiveScreen('fleet')} />
        )}

        {activeScreen === 'fleet' && (
          <FleetScreen onSelectVehicleForBooking={handleStartBooking} />
        )}

        {activeScreen === 'booking' && (
          <BookingFlow
            vehicle={selectedVehicle}
            user={currentUser}
            initialStep={bookingStep}
            initialBooking={activeBooking}
            onBackToFleet={() => setActiveScreen('fleet')}
            onRequestConfirmation={requestConfirmation}
          />
        )}

        {activeScreen === 'customer-dash' && (
          <CustomerDashboard
            user={currentUser}
            onOpenPayment={handleOpenPayment}
            onBrowseFleet={() => setActiveScreen('fleet')}
            onRequestConfirmation={requestConfirmation}
          />
        )}

        {activeScreen === 'partner-dash' && (
          <PartnerDashboard
            user={currentUser}
            onRequestConfirmation={requestConfirmation}
          />
        )}

        {activeScreen === 'admin-dash' && (
          <AdminDashboard
            onRequestConfirmation={requestConfirmation}
          />
        )}
      </main>

      {/* ABOUT US MODAL */}
      {showAboutModal && (
        <div className="overlay active" style={{ zIndex: 110 }} onClick={() => setShowAboutModal(false)}>
          <div className="modal" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-media" style={{ height: '160px', background: 'linear-gradient(135deg, #0F172A 0%, #151D30 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button className="modal-close" onClick={() => setShowAboutModal(false)}><X size={20} /></button>
              <Car size={48} color="var(--amber)" />
            </div>
            <div className="modal-body">
              <div className="kind">Official Mobility Portal</div>
              <h2>About RentalPort</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--steel-soft)', lineHeight: 1.6, marginBottom: '20px' }}>
                RentalPort is a premier digital vehicle rental ecosystem connecting drivers with curated cars and bicycles various cities in India
              </p>
              
              <div className="spec-grid" style={{ marginBottom: '20px' }}>
                <div className="spec"><div className="label">Active Fleet</div><div className="val">100+ Vehicles</div></div>
                <div className="spec"><div className="label">Verification</div><div className="val">100% Admin Approved</div></div>
                <div className="spec"><div className="label">Support</div><div className="val">24/7 Helpline</div></div>
                <div className="spec"><div className="label">Satisfaction</div><div className="val">4.5 Rating</div></div>
              </div>

              <button className="btn btn-amber" onClick={() => setShowAboutModal(false)}>
                Explore RentalPort Fleet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT US MODAL */}
      {showContactModal && (
        <div className="overlay active" style={{ zIndex: 110 }} onClick={() => setShowContactModal(false)}>
          <div className="modal" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div className="kind">Get in touch</div>
                  <h2 style={{ margin: 0 }}>Contact RentalPort Support</h2>
                </div>
                <button className="modal-close" style={{ position: 'relative', top: 0, right: 0 }} onClick={() => setShowContactModal(false)}>
                  <X size={20} />
                </button>
              </div>

              {contactSent ? (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <CheckCircle2 size={48} color="var(--green)" style={{ marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '6px' }}>Message Dispatched!</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--steel-soft)' }}>Our support team will reply to {contactEmail} shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSendContact}>
                  <div className="field">
                    <label>Your Name</label>
                    <input type="text" required placeholder="Jordan Rivera" value={contactName} onChange={e => setContactName(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Email Address</label>
                    <input type="email" required placeholder="you@example.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Message</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="How can we assist you with your rental?"
                      value={contactMessage}
                      onChange={e => setContactMessage(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', fontSize: '0.8rem', color: 'var(--steel-soft)' }}>
                    <span><Phone size={13} color="var(--amber)" /> +1 (800) 555-RENT</span>
                    <span><Mail size={13} color="var(--amber)" /> support@rentalport.com</span>
                  </div>

                  <button type="submit" className="btn btn-amber">
                    <Send size={16} /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECOND VERIFICATION CONFIRMATION OVERLAY */}
      <ConfirmationModal
        isOpen={confirmOpen}
        opts={confirmOpts}
        onConfirm={handleConfirmProceed}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
