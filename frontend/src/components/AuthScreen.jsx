import React, { useState } from 'react';
import { Mail, Lock, User, MapPin, ShieldCheck, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

export default function AuthScreen({ onEnterApp, onCancel }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [regRole, setRegRole] = useState('customer'); // 'customer' | 'partner'
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regErr, setRegErr] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoginErr('');
    if (!loginEmail || !loginPassword) {
      setLoginErr("Enter both your email and password.");
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Email and password don't match any account.");
      onEnterApp(data.user);
    } catch (err) {
      setLoginErr(err.message);
    }
  };

  const handleDemoLogin = (email, password) => {
    setLoginEmail(email);
    setLoginPassword(password);
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) onEnterApp(data.user);
      })
      .catch(console.error);
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    setRegErr('');
    if (!regName || !regEmail || !regPassword || !regCity || (regRole === 'customer' && !regLicense)) {
      setRegErr('Fill in every field to create your account.');
      return;
    }
    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      setRegErr('Enter a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setRegErr('Password needs to be at least 6 characters.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regRole,
          city: regCity,
          license: regLicense || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check the fields above and try again.');
      onEnterApp(data.user);
    } catch (err) {
      setRegErr(err.message);
    }
  };

  const tabOrder = ['login', 'register'];
  const activeIdx = tabOrder.indexOf(activeTab);

  return (
    <div className="auth-screen-wrap">
      <div className="auth-wrap">
        <div style={{ marginBottom: '16px', textAlign: 'left' }}>
          <button className="back-link" onClick={onCancel}>
            <ArrowLeft size={16} /> Return to browsing fleet
          </button>
        </div>

        <div className="auth-hero">
          <div><span className="dot"></span></div>
          <h1>RentalPort</h1>
          <p>Cars and bikes, ready when you are.</p>
        </div>

        <div className="plate-tabs">
          <button className={`plate-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')}>
            SIGN IN<span className="num">RP-001</span>
          </button>
          <button className={`plate-tab ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')}>
            REGISTER<span className="num">RP-002</span>
          </button>
          <div className="plate-indicator" style={{ width: '50%', transform: `translateX(${activeIdx * 100}%)` }}></div>
        </div>

        <div className="auth-card">
          {/* LOGIN PANE */}
          {activeTab === 'login' && (
            <div>
              <div className="demo-creds">
                <div style={{ marginBottom: '4px' }}>
                  <b style={{ color: '#FFFFFF' }}>Quick Demo Access:</b>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  <button
                    type="button"
                    style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--amber)', fontWeight: 700, cursor: 'pointer', padding: '5px 12px', borderRadius: '6px', fontSize: '0.78rem' }}
                    onClick={() => handleDemoLogin('admin@rentalport.com', 'admin123')}
                  >
                    Admin Demo
                  </button>
                  <button
                    type="button"
                    style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60A5FA', fontWeight: 700, cursor: 'pointer', padding: '5px 12px', borderRadius: '6px', fontSize: '0.78rem' }}
                    onClick={() => handleDemoLogin('partner@rentalport.com', 'partner123')}
                  >
                    Partner Demo
                  </button>
                </div>
              </div>

              <form onSubmit={handleLogin}>
                <div className="field">
                  <label htmlFor="login-email">Email Address</label>
                  <input
                    type="email"
                    id="login-email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="login-password">Password</label>
                  <input
                    type="password"
                    id="login-password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                  />
                </div>

                {loginErr && <div className="err" style={{ display: 'block' }}>{loginErr}</div>}

                <button type="submit" className="btn btn-amber" style={{ marginTop: '10px' }}>
                  Sign in <ArrowRight size={16} />
                </button>
              </form>

              <p className="auth-foot">
                No account yet?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('register'); }}>
                  Register here
                </a>
              </p>
            </div>
          )}

          {/* REGISTER PANE */}
          {activeTab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--steel-soft)', marginBottom: '10px' }}>
                I am registering as a...
              </label>

              <div className="role-picker">
                <button
                  type="button"
                  className={`role-opt ${regRole === 'customer' ? 'active' : ''}`}
                  onClick={() => setRegRole('customer')}
                >
                  <span className="ic">🧍</span>
                  <span className="lb">Customer</span>
                </button>
                <button
                  type="button"
                  className={`role-opt ${regRole === 'partner' ? 'active' : ''}`}
                  onClick={() => setRegRole('partner')}
                >
                  <span className="ic">🔧</span>
                  <span className="lb">Renting partner</span>
                </button>
              </div>

              <form onSubmit={handleRegister}>
                <div className="field">
                  <label htmlFor="reg-name">Full name</label>
                  <input
                    type="text"
                    id="reg-name"
                    placeholder="Jordan Rivera"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="reg-email">Email</label>
                  <input
                    type="email"
                    id="reg-email"
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                  />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="reg-password">Password</label>
                    <input
                      type="password"
                      id="reg-password"
                      placeholder="At least 6 characters"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                    />
                  </div>
                  {regRole === 'customer' && (
                    <div className="field">
                      <label htmlFor="reg-license">License No.</label>
                      <input
                        type="text"
                        id="reg-license"
                        placeholder="DL-2381092"
                        value={regLicense}
                        onChange={e => setRegLicense(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="reg-city">Home city</label>
                  <input
                    type="text"
                    id="reg-city"
                    placeholder="e.g. Austin"
                    value={regCity}
                    onChange={e => setRegCity(e.target.value)}
                  />
                </div>

                {regErr && <div className="err" style={{ display: 'block' }}>{regErr}</div>}

                <button type="submit" className="btn btn-amber" style={{ marginTop: '10px' }}>
                  Create account <ArrowRight size={16} />
                </button>
              </form>

              <p className="auth-foot">
                Already registered?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('login'); }}>
                  Sign in
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
