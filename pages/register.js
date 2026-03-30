import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const registerStyles = `
:root {
  --bg: #05080a;
  --bg2: #080d10;
  --bg3: #0c1318;
  --border: #112233;
  --border2: #1a3344;
  --green: #00e676;
  --green2: #00c853;
  --green3: #b9f6ca;
  --red: #ff5252;
  --amber: #ffab40;
  --blue: #40c4ff;
  --teal: #64ffda;
  --purple: #b388ff;
  --text: #cfd8dc;
  --muted: #607d8b;
  --muted2: #78909c;
  --mono: 'Share Tech Mono', monospace;
  --ui: 'Rajdhani', sans-serif;
  --head: 'Orbitron', monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--mono);
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── SCANLINES ── */
body::before {
  content: '';
  position: fixed; inset: 0; z-index: 20; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,.05) 3px, rgba(0,0,0,.05) 4px);
}

/* ── LASER GRID ── */
.laser-grid {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  perspective: 500px;
  overflow: hidden;
}

.grid-floor {
  position: absolute;
  bottom: 0; left: -50%;
  width: 200%; height: 80%;
  transform: rotateX(65deg);
  transform-origin: bottom center;
  background-image:
    linear-gradient(rgba(0,230,118,0.13) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,230,118,0.13) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: grid-scroll 5s linear infinite;
  mask-image: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 40%, transparent 75%);
}

@keyframes grid-scroll {
  0% { background-position: 0 0; }
  100% { background-position: 0 60px; }
}

/* ── PAGE CONTAINER ── */
.page {
  position: relative;
  z-index: 10;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* ── HEADER ── */
.header {
  text-align: center;
  margin-bottom: 50px;
}

.classified-badge {
  font-family: var(--head);
  font-size: 10px;
  font-weight: 700;
  color: var(--red);
  letter-spacing: 3px;
  margin-bottom: 10px;
}

.logo {
  font-family: var(--head);
  font-size: 42px;
  font-weight: 900;
  letter-spacing: 5px;
  text-transform: uppercase;
  background: linear-gradient(90deg, var(--green), var(--green3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 5px;
}

.presenter-sub {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.pre-label {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--muted);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.pre-name {
  font-family: var(--head);
  font-size: 14px;
  color: var(--green);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.logo-sub {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted2);
  letter-spacing: 2px;
  margin-bottom: 15px;
}

.divider {
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--green), transparent);
  margin: 0 auto;
}

/* ── MISSION BRIEF ── */
.mission-brief {
  background: rgba(0,230,118,.05);
  border: 1px solid rgba(0,230,118,.15);
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 40px;
}

.brief-label {
  font-family: var(--head);
  font-size: 10px;
  color: var(--amber);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.brief-text {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--text);
  line-height: 1.8;
  letter-spacing: 1px;
}

.brief-text span { color: var(--green); }
.brief-text em { color: var(--amber); font-style: italic; }

/* ── CARD ── */
.terminal-card {
  background: rgba(5, 8, 10, 0.85);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 50px rgba(0, 230, 118, 0.1);
}

.terminal-bar {
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid var(--border);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.t-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.t-dot.red { background: #ff5252; }
.t-dot.amber { background: #ffab40; }
.t-dot.green { background: #00e676; }

.terminal-bar-title {
  font-family: var(--head);
  font-size: 11px;
  color: var(--green);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-left: 10px;
}

.card-body {
  padding: 30px;
}

/* ── SECTION LABEL ── */
.section-label {
  font-family: var(--head);
  font-size: 10px;
  color: var(--amber);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-label::before {
  content: '▶';
  font-size: 8px;
  color: var(--green);
}

.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--border2), transparent);
}

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border2), transparent);
  margin: 30px 0;
}

/* ── FORM FIELDS ── */
.form-row {
  display: grid;
  gap: 20px;
  margin-bottom: 20px;
}

.cols-2 { grid-template-columns: repeat(2, 1fr); }
.cols-1 { grid-template-columns: 1fr; }

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-family: var(--ui);
  font-size: 12px;
  font-weight: 700;
  color: var(--green3);
  letter-spacing: 2px;
  text-transform: uppercase;
  display: block;
  text-shadow: 0 0 10px rgba(185, 246, 202, 0.3);
}

.field-hint {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--muted2);
  letter-spacing: 1px;
  margin-bottom: 2px;
}

.input-wrap {
  position: relative;
}

.input-wrap::before {
  content: '›';
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--green);
  opacity: 0.65;
  pointer-events: none;
  font-family: var(--mono);
}

input, select {
  width: 100%;
  background: rgba(5, 8, 10, 0.8);
  border: 1px solid var(--border2);
  border-radius: 4px;
  color: var(--green);
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 2px;
  padding: 11px 14px 11px 36px;
  outline: none;
  transition: border-color 0.25s, box-shadow 0.25s;
  caret-color: var(--green);
}

input::placeholder {
  color: var(--muted);
  letter-spacing: 1px;
  font-size: 11px;
}

input:focus, select:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 2px rgba(0, 230, 118, 0.13), 0 0 20px rgba(0, 230, 118, 0.08);
  background: rgba(0, 230, 118, 0.02);
}

input.error {
  border-color: var(--red);
  box-shadow: 0 0 0 2px rgba(255, 82, 82, 0.13);
}

.field-error {
  font-size: 9px;
  color: var(--red);
  letter-spacing: 1px;
  min-height: 12px;
  padding-left: 2px;
}

/* ── AGENT CARD ── */
.agent-card {
  background: rgba(5, 8, 10, 0.6);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 20px 22px;
  margin-bottom: 16px;
  position: relative;
  transition: border-color 0.2s;
}

.agent-card:hover {
  border-color: var(--border2);
}

.agent-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.agent-number {
  font-family: var(--head);
  font-size: 10px;
  background: rgba(0, 230, 118, 0.1);
  border: 1px solid var(--green);
  color: var(--green);
  padding: 3px 10px;
  border-radius: 2px;
  letter-spacing: 2px;
}

.agent-role {
  font-family: var(--mono);
  font-size: 9px;
  font-weight: 700;
  color: var(--muted2);
  letter-spacing: 2px;
}

.agent-card-header::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--border2), transparent);
}

/* ── STEP INDICATOR ── */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--border);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-family: var(--mono);
  font-size: 9px;
  font-weight: 700;
  color: var(--muted);
  letter-spacing: 2px;
  text-transform: uppercase;
  flex: 1;
  transition: color 0.3s;
}

.step.active {
  color: var(--green);
}

.step.done {
  color: var(--muted2);
}

.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  transition: background 0.3s, border-color 0.3s;
}

.step.active .step-num {
  background: rgba(0, 230, 118, 0.15);
  border-color: var(--green);
}

.step.done .step-num {
  background: rgba(0, 230, 118, 0.08);
}

.step-connector {
  width: 32px;
  height: 1px;
  background: var(--border);
  margin: 0 4px;
}

.step-connector.done {
  background: var(--muted);
}

/* ── SUBMIT BUTTON ── */
.btn-submit {
  width: 100%;
  background: transparent;
  border: 2px solid var(--green);
  border-radius: 4px;
  color: var(--green);
  font-family: var(--head);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
  padding: 16px;
  cursor: pointer;
  margin-top: 20px;
  position: relative;
  overflow: hidden;
  transition: color 0.3s, box-shadow 0.3s;
  text-shadow: 0 0 10px rgba(0, 230, 118, 0.5);
}

.btn-submit::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--green);
  transform: translateX(-101%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
}

.btn-submit:hover::before {
  transform: translateX(0);
}

.btn-submit:hover {
  color: var(--bg);
  box-shadow: 0 0 35px rgba(0, 230, 118, 0.4);
  text-shadow: none;
}

.btn-submit span {
  position: relative;
  z-index: 1;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ── STATUS MESSAGE ── */
.status-msg {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 12px;
  letter-spacing: 1px;
  text-align: center;
  min-height: 18px;
}

.status-msg.error {
  background: rgba(255, 82, 82, 0.1);
  border: 1px solid rgba(255, 82, 82, 0.3);
  color: var(--red);
}

.status-msg.success {
  background: rgba(0, 230, 118, 0.1);
  border: 1px solid rgba(0, 230, 118, 0.3);
  color: var(--green);
}

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .page { padding: 30px 15px; }
  .logo { font-size: 32px; letter-spacing: 3px; }
  .cols-2 { grid-template-columns: 1fr; }
  .card-body { padding: 20px; }
  .step-indicator { flex-wrap: wrap; }
  .step-connector { display: none; }
}
`;

export default function Register() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [formData, setFormData] = useState({
    teamName: '',
    department: '',
    year: '',
    teamSize: '',
    agents: []
  });
  const [status, setStatus] = useState({ type: '', message: '', show: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if admin is authenticated
    if (typeof window !== 'undefined') {
      const adminAuth = localStorage.getItem('admin_auth') === 'true';
      const authTime = localStorage.getItem('adminAuthTime');
      const now = new Date().getTime();
      
      // Admin session valid for 24 hours
      if (adminAuth && authTime && (now - parseInt(authTime) < 86400000)) {
        setIsAuthorized(true);
      } else {
        // Not authorized, redirect to admin login
        router.push('/admin/login');
      }
    }
  }, [router]);

  useEffect(() => {
    // Initialize agents array based on team size
    const size = parseInt(formData.teamSize) || 0;
    if (size > 0 && formData.agents.length !== size) {
      const agents = [];
      for (let i = 0; i < size; i++) {
        agents.push({
          name: '',
          usn: '',
          email: '',
          phone: ''
        });
      }
      setFormData(prev => ({
        ...prev,
        agents
      }));
    }
  }, [formData.teamSize]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAgentChange = (index, field, value) => {
    const newAgents = [...formData.agents];
    newAgents[index][field] = value;
    setFormData(prev => ({
      ...prev,
      agents: newAgents
    }));
  };

  const validateForm = () => {
    if (!formData.teamName.trim()) {
      setStatus({ type: 'error', message: '◆ TEAM NAME REQUIRED ◆', show: true });
      return false;
    }
    if (!formData.department) {
      setStatus({ type: 'error', message: '◆ DEPARTMENT REQUIRED ◆', show: true });
      return false;
    }
    if (!formData.year) {
      setStatus({ type: 'error', message: '◆ YEAR REQUIRED ◆', show: true });
      return false;
    }
    if (!formData.teamSize) {
      setStatus({ type: 'error', message: '◆ TEAM SIZE REQUIRED ◆', show: true });
      return false;
    }

    for (let i = 0; i < formData.agents.length; i++) {
      const agent = formData.agents[i];
      if (!agent.name.trim()) {
        setStatus({ type: 'error', message: `◆ AGENT ${i + 1} NAME REQUIRED ◆`, show: true });
        return false;
      }
      if (!agent.usn.trim()) {
        setStatus({ type: 'error', message: `◆ AGENT ${i + 1} USN REQUIRED ◆`, show: true });
        return false;
      }
      if (!agent.email.trim()) {
        setStatus({ type: 'error', message: `◆ AGENT ${i + 1} EMAIL REQUIRED ◆`, show: true });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '', show: false });

    try {
      // Generate team ID and access code
      const teamId = `TEAM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Register team in Supabase
      const { data, error } = await supabase
        .from('team_config')
        .insert([
          {
            team_id: teamId,
            team_name: formData.teamName,
            department: formData.department,
            year: formData.year,
            team_size: parseInt(formData.teamSize),
            access_code: accessCode,
            agents: formData.agents,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      setStatus({
        type: 'success',
        message: `✓ REGISTRATION COMPLETE - Team ID: ${teamId} | Access Code: ${accessCode}`,
        show: true
      });

      setTimeout(() => {
        sessionStorage.setItem('teamId', teamId);
        sessionStorage.setItem('teamName', formData.teamName);
        router.push('/auth-login');
      }, 2000);
    } catch (err) {
      setStatus({
        type: 'error',
        message: '◆ REGISTRATION FAILED ◆',
        show: true
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>CODE HEIST - Agent Recruitment</title>
        <meta name="description" content="Register your team for CODE HEIST" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {!isAuthorized ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#050810', color: '#00e676', fontFamily: 'monospace' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', letterSpacing: '2px' }}>🔒 REDIRECTING TO AUTHENTICATION...</p>
          </div>
        </div>
      ) : (
        <>
      <style>{registerStyles}</style>

      <div className="laser-grid">
        <div className="grid-floor" />
      </div>

      <div className="page">
        <div className="header">
          <div className="classified-badge">⚠ AGENT RECRUITMENT ⚠</div>
          <div className="logo">CODE HEIST</div>
          <div className="presenter-sub">
            <span className="pre-label">presented by</span>
            <span className="pre-name">Java & OOP Community</span>
          </div>
          <div className="logo-sub">Inherit the Clues · Override the Competition</div>
          <div className="divider" />
        </div>

        <div className="mission-brief">
          <div className="brief-label">OPERATION BRIEFING</div>
          <div className="brief-text">
            The vault is sealed. The clock is running. Four levels of <span>Java & OOP</span> mastery stand between your crew and the ultimate heist.
            To gain clearance, you must register your squad below. Each team must have <em>2–4 agents</em>.
            <br /><br />
            <em>// Only registered agents may participate. Stand by for mission briefing.</em>
          </div>
        </div>

        <div className="terminal-card">
          <div className="terminal-bar">
            <div className="t-dot red" />
            <div className="t-dot amber" />
            <div className="t-dot green" />
            <span className="terminal-bar-title">SQUAD REGISTRATION TERMINAL</span>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="section-label">SQUAD IDENTITY</div>

              <div className="form-row cols-2">
                <div className="field">
                  <label className="field-label">Team Name</label>
                  <div className="field-hint">// Your crew's codename</div>
                  <div className="input-wrap">
                    <input
                      type="text"
                      name="teamName"
                      value={formData.teamName}
                      onChange={handleInputChange}
                      placeholder="e.g.  NULL POINTERS"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Department</label>
                  <div className="field-hint">// Your academic division</div>
                  <div className="input-wrap">
                    <select name="department" value={formData.department} onChange={handleInputChange} disabled={loading}>
                      <option value="">— SELECT DEPT —</option>
                      <option value="CSE">CSE</option>
                      <option value="ISE">ISE</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="ME">ME</option>
                      <option value="CE">CE</option>
                      <option value="AIDS">AIDS</option>
                      <option value="AIML">AIML</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row cols-2">
                <div className="field">
                  <label className="field-label">Year</label>
                  <div className="field-hint">// Current academic year</div>
                  <div className="input-wrap">
                    <select name="year" value={formData.year} onChange={handleInputChange} disabled={loading}>
                      <option value="">— SELECT YEAR —</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Team Size</label>
                  <div className="field-hint">// Number of agents (2–4)</div>
                  <div className="input-wrap">
                    <select name="teamSize" value={formData.teamSize} onChange={handleInputChange} disabled={loading}>
                      <option value="">— SELECT SIZE —</option>
                      <option value="2">2 Agents</option>
                      <option value="3">3 Agents</option>
                      <option value="4">4 Agents</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="section-divider" />

              {formData.agents.length > 0 && (
                <>
                  <div className="section-label">AGENT PROFILES</div>

                  {formData.agents.map((agent, i) => (
                    <div key={i} className="agent-card">
                      <div className="agent-card-header">
                        <div className="agent-number">{`AGENT-${String(i + 1).padStart(2, '0')}`}</div>
                        <div className="agent-role">// Agent profile</div>
                      </div>
                      <div className="form-row cols-2">
                        <div className="field">
                          <label className="field-label">Full Name</label>
                          <div className="field-hint">// Agent's real identity</div>
                          <div className="input-wrap">
                            <input
                              type="text"
                              value={agent.name}
                              onChange={(e) => handleAgentChange(i, 'name', e.target.value)}
                              placeholder="e.g.  ALEX CIPHER"
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="field">
                          <label className="field-label">USN</label>
                          <div className="field-hint">// University Serial Number</div>
                          <div className="input-wrap">
                            <input
                              type="text"
                              value={agent.usn}
                              onChange={(e) => handleAgentChange(i, 'usn', e.target.value.toUpperCase())}
                              placeholder="e.g.  1XX22CS001"
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-row cols-2">
                        <div className="field">
                          <label className="field-label">Email</label>
                          <div className="field-hint">// Contact email</div>
                          <div className="input-wrap">
                            <input
                              type="text"
                              value={agent.email}
                              onChange={(e) => handleAgentChange(i, 'email', e.target.value)}
                              placeholder="e.g.  agent@mail.com"
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="field">
                          <label className="field-label">Phone</label>
                          <div className="field-hint">// Contact number</div>
                          <div className="input-wrap">
                            <input
                              type="text"
                              value={agent.phone}
                              onChange={(e) => handleAgentChange(i, 'phone', e.target.value)}
                              placeholder="e.g.  +91 XXXXXXXXXX"
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {status.show && (
                <div className={`status-msg ${status.type}`}>
                  {status.message}
                </div>
              )}

              <button type="submit" className="btn-submit" disabled={loading}>
                <span>{loading ? '◆ REGISTERING... ◆' : '⚡ ENLIST SQUAD ⚡'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
        </>
      )}
    </>
  );
}
