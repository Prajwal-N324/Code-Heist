import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const loginStyles = `
:root {
  --bg: #050810;
  --green: #00e676;
  --green3: #b9f6ca;
  --red: #ff5252;
  --amber: #ffc107;
  --muted: #888899;
  --muted2: #666677;
  --border: rgba(0,230,118,.2);
  --border2: rgba(0,230,118,.4);
  --head: 'Orbitron', monospace;
  --ui: 'Rajdhani', monospace;
  --mono: 'Share Tech Mono', monospace;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html { font-size: 16px; }
body {
  background-color: var(--bg);
  color: var(--green);
  font-family: var(--ui);
  line-height: 1.6;
  overflow-x: hidden;
}

/* ── BACKGROUND LASER GRID ── */
.bg-grid {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image:
    linear-gradient(0deg, rgba(0,230,118,.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,230,118,.05) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 1;
  animation: grid-drift 20s linear infinite;
}

@keyframes grid-drift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

/* ── PARTICLES ── */
.particles {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: var(--green);
  border-radius: 50%;
  opacity: 0.6;
  animation: float-up 8s linear infinite;
}

@keyframes float-up {
  0% { opacity: 0; transform: translateY(100vh) translateX(0); }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% { opacity: 0; transform: translateY(-100vh) translateX(100px); }
}

/* ── MAIN CONTAINER ── */
.login-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

/* ── CARD ── */
.card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: rgba(5, 8, 10, 0.85);
  border: 1px solid var(--border);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 50px rgba(0, 230, 118, 0.1);
  overflow: hidden;
  animation: card-glow 0.6s ease-out;
}

@keyframes card-glow {
  from { box-shadow: 0 0 20px rgba(0, 230, 118, 0.3); }
  to { box-shadow: 0 0 50px rgba(0, 230, 118, 0.1); }
}

/* ── CARD HEADER ── */
.card-header {
  border-bottom: 1px solid var(--border);
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header h1 {
  font-family: var(--head);
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
  background: linear-gradient(90deg, var(--green), var(--green3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  line-height: 1.2;
}

.card-header p {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted2);
  font-weight: 700;
  letter-spacing: 3px;
  margin-left: auto;
  margin-right: auto;
}

/* ── CARD BODY ── */
.card-body {
  padding: 26px 32px 28px;
}

/* ── SECTION LABEL ── */
.section-label {
  font-family: var(--head);
  font-size: 11px;
  color: var(--amber);
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-label::before {
  content: '▶';
  font-size: 9px;
  color: var(--green);
}

.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--border2), transparent);
}

/* ── FORM FIELDS ── */
.field {
  margin-bottom: 18px;
}

.field-label {
  font-family: var(--ui);
  font-size: 17px;
  font-weight: 700;
  color: var(--green3);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 5px;
  display: block;
  text-shadow: 0 0 10px rgba(185, 246, 202, 0.3);
}

.field-hint {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--muted2);
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 7px;
}

.input-wrap {
  position: relative;
}

.input-wrap::before {
  content: '›';
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: var(--green);
  opacity: 0.65;
  pointer-events: none;
  font-family: var(--mono);
}

input[type="text"],
input[type="password"] {
  width: 100%;
  background: rgba(5, 8, 10, 0.8);
  border: 1px solid var(--border2);
  border-radius: 4px;
  color: var(--green);
  font-family: var(--mono);
  font-size: 18px;
  letter-spacing: 3px;
  padding: 13px 14px 13px 36px;
  outline: none;
  transition: border-color 0.25s, box-shadow 0.25s;
  caret-color: var(--green);
}

input[type="text"]::placeholder,
input[type="password"]::placeholder {
  color: var(--muted);
  letter-spacing: 2px;
  font-size: 13px;
}

input[type="text"]:focus,
input[type="password"]:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 2px rgba(0, 230, 118, 0.13), 0 0 20px rgba(0, 230, 118, 0.08);
  background: rgba(0, 230, 118, 0.02);
}

/* ── SUBMIT BUTTON ── */
.btn-access {
  width: 100%;
  background: transparent;
  border: 2px solid var(--green);
  border-radius: 4px;
  color: var(--green);
  font-family: var(--head);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 5px;
  text-transform: uppercase;
  padding: 15px;
  cursor: pointer;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
  transition: color 0.3s, box-shadow 0.3s;
  text-shadow: 0 0 10px rgba(0, 230, 118, 0.5);
}

.btn-access::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--green);
  transform: translateX(-101%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.btn-access:hover::before {
  transform: translateX(0);
}

.btn-access:hover {
  color: var(--bg);
  box-shadow: 0 0 35px rgba(0, 230, 118, 0.4);
  text-shadow: none;
}

.btn-access span {
  position: relative;
  z-index: 1;
}

.btn-access:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ── STATUS / ERROR ── */
.status-line {
  height: 32px;
  margin-top: 14px;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 2px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.status-line.show {
  opacity: 1;
}

.status-line.error {
  color: var(--red);
}

.status-line.success {
  color: var(--green);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: blink-dot 0.7s step-end infinite;
}

@keyframes blink-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ── FOOTER ── */
.card-footer {
  border-top: 1px solid var(--border);
  padding: 11px 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 9px;
  color: var(--muted2);
  letter-spacing: 2px;
  font-family: var(--mono);
}

.footer-secure {
  font-family: var(--head);
  color: var(--green);
  opacity: 0.6;
}

@media (max-width: 600px) {
  .card { max-width: 100%; }
  .card-header h1 { font-size: 20px; letter-spacing: 3px; }
  .field-label { font-size: 14px; }
  input[type="text"],
  input[type="password"] { font-size: 16px; padding: 11px 12px 11px 32px; }
  .btn-access { font-size: 14px; padding: 12px; }
}
`;

export default function AuthLogin() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    teamId: '',
    accessCode: ''
  });
  const [status, setStatus] = useState({ type: '', message: '', show: false });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '', show: false });

    try {
      if (!credentials.teamId || !credentials.accessCode) {
        setStatus({
          type: 'error',
          message: '◆ MISSING CREDENTIALS ◆',
          show: true
        });
        setLoading(false);
        return;
      }

      // Verify credentials against Supabase
      const { data, error } = await supabase
        .from('team_config')
        .select('*')
        .eq('team_id', credentials.teamId)
        .eq('access_code', credentials.accessCode)
        .single();

      if (error || !data) {
        setStatus({
          type: 'error',
          message: '◆ INVALID CREDENTIALS ◆',
          show: true
        });
        setLoading(false);
        return;
      }

      // Success - store session and redirect
      sessionStorage.setItem('teamId', data.team_id);
      sessionStorage.setItem('teamName', data.team_name);
      
      setStatus({
        type: 'success',
        message: '✓ ACCESS GRANTED',
        show: true
      });

      setTimeout(() => {
        router.push('/play-new');
      }, 800);
    } catch (err) {
      setStatus({
        type: 'error',
        message: '◆ SYSTEM ERROR ◆',
        show: true
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>CODE HEIST - Team Access</title>
        <meta name="description" content="Authenticate your team" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&family=Rajdhani:wght@400;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </Head>

      <style>{loginStyles}</style>

      <div className="bg-grid" />
      <div className="particles">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 8 + 's',
              animationDuration: (Math.random() * 4 + 6) + 's'
            }}
          />
        ))}
      </div>

      <div className="login-wrapper">
        <div className="card">
          <div className="card-header">
            <h1>TEAM ACCESS</h1>
            <p>AUTHENTICATION PROTOCOL V2.7</p>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="section-label">Credentials Input</div>

              <div className="field">
                <label className="field-label">TEAM ID</label>
                <div className="input-wrap">
                  <input
                    type="text"
                    name="teamId"
                    value={credentials.teamId}
                    onChange={handleInputChange}
                    placeholder="Enter your team identifier"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="field">
                <label className="field-label">ACCESS CODE</label>
                <div className="input-wrap">
                  <input
                    type="password"
                    name="accessCode"
                    value={credentials.accessCode}
                    onChange={handleInputChange}
                    placeholder="Enter your access code"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={`status-line ${status.show ? 'show' : ''} ${status.type}`}>
                {status.type && <div className="status-dot" />}
                {status.message}
              </div>

              <button type="submit" className="btn-access" disabled={loading}>
                <span>{loading ? '◆ CONNECTING... ◆' : '⚡ AUTHENTICATE ⚡'}</span>
              </button>
            </form>
          </div>

          <div className="card-footer">
            <span className="footer-code">v2.7 // AUTH_SYSTEM</span>
            <span className="footer-secure">🔒 ENCRYPTED</span>
          </div>
        </div>
      </div>
    </>
  );
}
