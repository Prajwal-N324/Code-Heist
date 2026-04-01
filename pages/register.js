import React, { useState } from 'react';
import Head from 'next/head';

const registerStyles = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

:root {
  --bg:      #05080a;
  --bg2:     #080d10;
  --bg3:     #0c1318;
  --border:  #112233;
  --border2: #1a3344;
  --green:   #00e676;
  --green2:  #00c853;
  --green3:  #b9f6ca;
  --red:     #ff5252;
  --amber:   #ffab40;
  --blue:    #40c4ff;
  --teal:    #64ffda;
  --purple:  #b388ff;
  --text:    #cfd8dc;
  --muted:   #607d8b;
  --muted2:  #78909c;
  --mono:    'Share Tech Mono', monospace;
  --ui:      'Rajdhani', sans-serif;
  --head:    'Orbitron', monospace;
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

/* ── FILM GRAIN ── */
body::after {
  content: '';
  position: fixed; inset: 0; z-index: 19; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  opacity: 0.3;
}

/* ── LASER GRID BACKGROUND ── */
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
  0%   { background-position: 0 0; }
  100% { background-position: 0 60px; }
}
.grid-ceil {
  position: absolute;
  top: 0; left: -50%;
  width: 200%; height: 55%;
  transform: rotateX(-65deg);
  transform-origin: top center;
  background-image:
    linear-gradient(rgba(255,171,64,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,171,64,0.06) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: grid-scroll 6s linear infinite;
  mask-image: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 40%, transparent 75%);
}
.laser-sweep {
  position: absolute; top: 0; bottom: 0; width: 2px;
  background: linear-gradient(180deg, transparent 0%, rgba(0,230,118,0.5) 40%, rgba(0,230,118,0.8) 50%, rgba(0,230,118,0.5) 60%, transparent 100%);
  filter: blur(1px);
  animation: laser-move linear infinite;
  opacity: 0;
}
.laser-sweep:nth-child(3) { animation-duration: 8s;  animation-delay: 0s; }
.laser-sweep:nth-child(4) { animation-duration: 11s; animation-delay: 3.5s; background: linear-gradient(180deg, transparent, rgba(255,171,64,0.35), rgba(255,171,64,0.6), rgba(255,171,64,0.35), transparent); }
.laser-sweep:nth-child(5) { animation-duration: 9s;  animation-delay: 6s; }
@keyframes laser-move {
  0%   { left: -2px; opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 1; }
  100% { left: 100%; opacity: 0; }
}
.laser-h {
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0,230,118,0.4), rgba(0,230,118,0.7), rgba(0,230,118,0.4), transparent);
  filter: blur(1px);
  animation: laser-h-move linear infinite;
  opacity: 0;
}
.laser-h:nth-child(6) { animation-duration: 12s; animation-delay: 1s; }
.laser-h:nth-child(7) { animation-duration: 15s; animation-delay: 7s; background: linear-gradient(90deg, transparent, rgba(255,171,64,0.25), rgba(255,171,64,0.5), rgba(255,171,64,0.25), transparent); }
@keyframes laser-h-move {
  0%   { top: -2px; opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

/* ── AMBIENT GLOWS ── */
.glow-center {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 650px; height: 650px; pointer-events: none; z-index: 1;
  background: radial-gradient(ellipse at center, rgba(0,230,118,.07) 0%, rgba(0,100,60,.02) 45%, transparent 70%);
  animation: pglow 5s ease-in-out infinite;
}
.glow-amber {
  position: fixed; top: 10%; right: 5%; width: 300px; height: 300px;
  pointer-events: none; z-index: 1;
  background: radial-gradient(circle, rgba(255,171,64,.055) 0%, transparent 65%);
  animation: pglow2 8s ease-in-out infinite;
}
@keyframes pglow  { 0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.1)} }
@keyframes pglow2 { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.7;transform:scale(1.15)} }

/* ── CITY SKYLINE ── */
.skyline {
  position: fixed; bottom: 0; left: 0; right: 0;
  height: 32vh; pointer-events: none; z-index: 2;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 280' preserveAspectRatio='xMidYMax slice'%3E%3Cg fill='%23040908'%3E%3Crect x='0' y='140' width='60' height='140'/%3E%3Crect x='30' y='100' width='40' height='180'/%3E%3Crect x='80' y='120' width='50' height='160'/%3E%3Crect x='140' y='80' width='30' height='200'/%3E%3Crect x='150' y='60' width='15' height='220'/%3E%3Crect x='180' y='130' width='70' height='150'/%3E%3Crect x='260' y='90' width='45' height='190'/%3E%3Crect x='315' y='110' width='35' height='170'/%3E%3Crect x='360' y='70' width='55' height='210'/%3E%3Crect x='370' y='40' width='10' height='240'/%3E%3Crect x='430' y='100' width='65' height='180'/%3E%3Crect x='510' y='120' width='40' height='160'/%3E%3Crect x='560' y='85' width='30' height='195'/%3E%3Crect x='600' y='60' width='50' height='220'/%3E%3Crect x='660' y='110' width='45' height='170'/%3E%3Crect x='715' y='90' width='60' height='190'/%3E%3Crect x='785' y='70' width='35' height='210'/%3E%3Crect x='830' y='100' width='55' height='180'/%3E%3Crect x='895' y='130' width='40' height='150'/%3E%3Crect x='945' y='80' width='50' height='200'/%3E%3Crect x='1005' y='110' width='65' height='170'/%3E%3Crect x='1080' y='90' width='30' height='190'/%3E%3Crect x='1120' y='60' width='45' height='220'/%3E%3Crect x='1175' y='120' width='55' height='160'/%3E%3Crect x='1240' y='80' width='40' height='200'/%3E%3Crect x='1290' y='100' width='60' height='180'/%3E%3Crect x='1360' y='70' width='80' height='210'/%3E%3C/g%3E%3Cg fill='%2300e676' opacity='0.2'%3E%3Crect x='154' y='52' width='4' height='8'/%3E%3Crect x='373' y='32' width='4' height='8'/%3E%3Crect x='603' y='52' width='4' height='8'/%3E%3Crect x='1123' y='52' width='4' height='8'/%3E%3C/g%3E%3C/svg%3E") no-repeat bottom;
  background-size: cover;
  opacity: 0.75;
}

/* ── FLOATING PARTICLES ── */
.particles { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 3; }
.particle {
  position: absolute; width: 2px; height: 2px; border-radius: 50%;
  background: var(--green); opacity: 0;
  animation: float-up linear infinite;
}
.particle:nth-child(1){left:8%;animation-duration:13s;animation-delay:0s}
.particle:nth-child(2){left:22%;animation-duration:16s;animation-delay:4s;background:var(--amber);width:3px;height:3px}
.particle:nth-child(3){left:38%;animation-duration:11s;animation-delay:1.5s}
.particle:nth-child(4){left:55%;animation-duration:14s;animation-delay:6s;background:var(--blue)}
.particle:nth-child(5){left:72%;animation-duration:12s;animation-delay:2.5s}
.particle:nth-child(6){left:90%;animation-duration:15s;animation-delay:8s;background:var(--amber)}
@keyframes float-up {
  0%  {transform:translateY(100vh) scale(0);opacity:0}
  10% {opacity:0.7}
  90% {opacity:0.2}
  100%{transform:translateY(-5vh) scale(1.5);opacity:0}
}

/* ══════════════════════════════════
   PAGE WRAPPER
══════════════════════════════════ */
.page {
  position: relative; z-index: 10;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 80px;
}

/* ── HEADER AREA ── */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
  animation: fade-in 0.8s ease forwards;
}
@keyframes fade-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

.classified-badge {
  display: inline-block;
  border: 2px solid var(--red);
  color: var(--red);
  font-family: var(--head);
  font-size: 10px;
  letter-spacing: 5px;
  padding: 5px 18px;
  transform: rotate(-2deg);
  margin-bottom: 14px;
  animation: badge-pulse 3s ease-in-out infinite;
}
@keyframes badge-pulse { 0%,100%{box-shadow:0 0 0 rgba(255,82,82,0)} 50%{box-shadow:0 0 14px rgba(255,82,82,0.4)} }

.logo {
  font-family: var(--head);
  font-size: clamp(46px, 11vw, 80px);
  font-weight: 900;
  color: var(--green);
  letter-spacing: 8px;
  line-height: 1;
  text-align: center;
  text-shadow:
    0 0 20px rgba(0,230,118,.9),
    0 0 50px rgba(0,230,118,.5),
    0 0 100px rgba(0,230,118,.25);
  animation: flicker 9s infinite;
}
@keyframes flicker {
  0%,87%,100%{opacity:1}
  88%{opacity:.6} 89%{opacity:1} 92%{opacity:.4} 93%{opacity:1}
}

.presenter-sub {
  display: flex; flex-direction: column; align-items: center;
  gap: 1px; margin-top: 8px; margin-bottom: 4px;
}
.pre-label {
  font-family: var(--ui); font-size: 12px; font-weight: 700;
  color: var(--blue); letter-spacing: 3px; text-transform: uppercase;
  text-shadow: 0 0 12px rgba(64,196,255,0.8);
  animation: pre-flicker 11s infinite;
}
.pre-name {
  font-family: var(--ui); font-size: 15px; font-weight: 700;
  color: var(--blue); letter-spacing: 3px; text-transform: uppercase;
  text-shadow: 0 0 16px rgba(64,196,255,0.9);
  animation: pre-flicker 11s infinite; animation-delay: -4s;
}
@keyframes pre-flicker {
  0%,85%,100%{opacity:1} 86%{opacity:0.6} 87%{opacity:1} 90%{opacity:0.35} 91%{opacity:1}
}

.logo-sub {
  font-family: var(--ui);
  font-size: clamp(12px, 2.3vw, 15px);
  color: var(--amber); letter-spacing: 5px; font-weight: 500;
  text-transform: uppercase; margin-top: 6px; text-align: center;
  text-shadow: 0 0 18px rgba(255,171,64,.5);
}

.divider {
  width: 320px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--green2), var(--amber), var(--green2), transparent);
  margin: 14px auto; opacity: 0.55;
}

/* ── MISSION BRIEF ── */
.mission-brief {
  max-width: 680px;
  background: rgba(8,13,16,0.75);
  border: 1px solid var(--border2);
  border-left: 3px solid var(--amber);
  border-radius: 4px;
  padding: 18px 24px;
  margin-bottom: 28px;
  animation: fade-in 1s ease 0.2s both;
  width: 100%;
}
.brief-label {
  font-family: var(--head); font-size: 9px; color: var(--amber);
  letter-spacing: 4px; margin-bottom: 8px;
  display: flex; align-items: center; gap: 8px;
}
.brief-label::before { content: '▶'; color: var(--green); font-size: 8px; }
.brief-text {
  font-family: var(--mono); font-size: 11px; font-weight: 700; color: var(--muted2);
  line-height: 1.8; letter-spacing: 1px;
}
.brief-text span { color: var(--green3); }
.brief-text em { color: var(--amber); font-style: normal; }

/* ══════════════════════════════════
   TERMINAL CARD (form container)
══════════════════════════════════ */
.terminal-card {
  background: rgba(8,13,16,0.87);
  border: 1px solid var(--border2);
  border-top: 2px solid var(--green);
  border-radius: 6px;
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 760px;
  overflow: hidden;
  box-shadow:
    0 0 50px rgba(0,230,118,.07),
    0 0 120px rgba(0,230,118,.03),
    inset 0 1px 0 rgba(0,230,118,.09);
  animation: fade-in 1s ease 0.4s both;
}

.terminal-bar {
  background: rgba(5,8,10,0.95);
  border-bottom: 1px solid var(--border);
  padding: 9px 16px;
  display: flex; align-items: center; gap: 7px;
}
.t-dot { width: 10px; height: 10px; border-radius: 50%; }
.t-dot.red   { background: #ff5f57; }
.t-dot.amber { background: #febc2e; }
.t-dot.green { background: #28c840; }
.terminal-bar-title {
  font-family: var(--head); font-size: 9px;
  color: var(--muted2); font-weight: 700; letter-spacing: 3px;
  margin-left: auto; margin-right: auto;
}

.card-body { padding: 30px 36px 36px; }

/* ── SECTION LABELS ── */
.section-label {
  font-family: var(--head); font-size: 11px;
  color: var(--amber); letter-spacing: 4px;
  text-transform: uppercase; margin-bottom: 20px;
  display: flex; align-items: center; gap: 10px;
}
.section-label::before { content: '▶'; font-size: 9px; color: var(--green); }
.section-label::after  { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, var(--border2), transparent); }

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, var(--border2), transparent);
  margin: 28px 0;
}

/* ── FORM FIELDS ── */
.form-row {
  display: grid;
  gap: 18px;
  margin-bottom: 18px;
}
.form-row.cols-2 { grid-template-columns: 1fr 1fr; }
.form-row.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
.form-row.cols-1 { grid-template-columns: 1fr; }

@media (max-width: 600px) {
  .form-row.cols-2,
  .form-row.cols-3 { grid-template-columns: 1fr; }
  .card-body { padding: 22px 18px 28px; }
}

.field { display: flex; flex-direction: column; gap: 5px; }

.field-label {
  font-family: var(--ui); font-size: 13px; font-weight: 700;
  color: var(--green3); letter-spacing: 3px; text-transform: uppercase;
  display: block; text-shadow: 0 0 10px rgba(185,246,202,.3);
}

.field-hint {
  font-family: var(--mono); font-size: 10px;
  color: var(--muted2); letter-spacing: 1px; margin-bottom: 2px;
}

.input-wrap { position: relative; }
.input-wrap::before {
  content: '›';
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  font-size: 20px; color: var(--green); opacity: 0.65;
  pointer-events: none; font-family: var(--mono);
}

.field input,
.field select {
  width: 100%;
  background: rgba(5,8,10,0.8);
  border: 1px solid var(--border2);
  border-radius: 4px;
  color: var(--green);
  font-family: var(--mono);
  font-size: 14px;
  letter-spacing: 2px;
  padding: 11px 14px 11px 36px;
  outline: none;
  transition: border-color .25s, box-shadow .25s;
  caret-color: var(--green);
  -webkit-appearance: none;
  appearance: none;
}
.field input::placeholder {
  color: var(--muted); letter-spacing: 2px; font-size: 11px;
}
.field input:focus,
.field select:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 2px rgba(0,230,118,.13), 0 0 20px rgba(0,230,118,.08);
  background: rgba(0,230,118,.02);
}
.field input.error, .field select.error {
  border-color: var(--red);
  box-shadow: 0 0 0 2px rgba(255,82,82,.13);
}
.field-error {
  font-size: 10px; color: var(--red); letter-spacing: 1px;
  min-height: 14px; padding-left: 2px;
}

/* Select arrow */
.select-wrap { position: relative; }
.select-wrap::before {
  content: '›'; position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  font-size: 20px; color: var(--green); opacity: 0.65; pointer-events: none; font-family: var(--mono); z-index: 1;
}
.select-wrap::after {
  content: '▾'; position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  font-size: 12px; color: var(--muted2); pointer-events: none;
}

/* ── AGENT CARD ── */
.agent-card {
  background: rgba(5,8,10,0.6);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 20px 22px;
  margin-bottom: 16px;
  position: relative;
  transition: border-color .2s;
}
.agent-card:hover { border-color: var(--border2); }
.agent-card-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
}
.agent-number {
  font-family: var(--head); font-size: 11px;
  background: rgba(0,230,118,.1); border: 1px solid var(--green);
  color: var(--green); padding: 3px 10px; border-radius: 2px; letter-spacing: 2px;
}
.agent-role {
  font-family: var(--mono); font-size: 10px; font-weight: 700; color: var(--muted2); letter-spacing: 2px;
}
.agent-card-header::after {
  content: ''; flex: 1; height: 1px;
  background: linear-gradient(90deg, var(--border2), transparent);
}

/* ── SUBMIT BUTTON ── */
.btn-submit {
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
  padding: 16px;
  cursor: pointer;
  margin-top: 10px;
  position: relative;
  overflow: hidden;
  transition: color .3s, box-shadow .3s;
  text-shadow: 0 0 10px rgba(0,230,118,.5);
}
.btn-submit::before {
  content: '';
  position: absolute; inset: 0;
  background: var(--green);
  transform: translateX(-101%);
  transition: transform .35s cubic-bezier(.4,0,.2,1);
  z-index: 0;
}
.btn-submit:hover::before { transform: translateX(0); }
.btn-submit:hover { color: var(--bg); box-shadow: 0 0 35px rgba(0,230,118,.4); text-shadow: none; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-submit span { position: relative; z-index: 1; }

/* ── CARD FOOTER ── */
.card-footer {
  border-top: 1px solid var(--border);
  padding: 11px 36px;
  display: flex; align-items: center; justify-content: space-between;
}
.footer-code { font-family: var(--mono); font-size: 9px; font-weight: 700; color: var(--muted); letter-spacing: 2px; }
.footer-secure { font-family: var(--head); font-size: 8px; color: var(--green); letter-spacing: 2px; opacity: 0.6; }

/* ── BOTTOM BADGE ── */
.team-badge {
  margin-top: 18px;
  display: flex; align-items: center; justify-content: center;
  gap: 8px; font-family: var(--mono); font-size: 10px;
  font-weight: 700; color: var(--muted2); letter-spacing: 2px;
}
.team-badge-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--green); opacity: 0.6;
  animation: blink-dot 1.4s step-end infinite;
}
@keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:0} }

/* ── SUCCESS OVERLAY ── */
.success-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: var(--bg);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  opacity: 0; pointer-events: none;
  transition: opacity .4s;
  gap: 16px;
  text-align: center;
  padding: 20px;
}
.success-overlay.show { opacity: 1; pointer-events: all; }
.success-title {
  font-family: var(--head);
  font-size: clamp(26px, 6vw, 48px);
  font-weight: 900; color: var(--green);
  letter-spacing: 6px;
  text-shadow: 0 0 40px rgba(0,230,118,.6), 0 0 80px rgba(0,230,118,.3);
  animation: granted-pulse .8s ease-in-out infinite alternate;
}
@keyframes granted-pulse {
  from { text-shadow: 0 0 30px rgba(0,230,118,.5); }
  to   { text-shadow: 0 0 60px rgba(0,230,118,.9), 0 0 100px rgba(0,230,118,.4); }
}
.success-sub { font-family: var(--ui); font-size: 17px; color: var(--amber); letter-spacing: 4px; text-transform: uppercase; }
.success-id {
  font-family: var(--mono); font-size: 13px; color: var(--green3);
  border: 1px solid var(--border2); padding: 10px 24px; border-radius: 4px;
  letter-spacing: 3px;
}
.success-msg {
  font-family: var(--mono); font-size: 11px; color: var(--muted2);
  max-width: 440px; line-height: 1.8; letter-spacing: 1px; margin-top: 8px;
}
.success-bar { width: 300px; height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; margin-top: 12px; }
.success-bar-fill { height: 100%; background: linear-gradient(90deg, var(--green2), var(--teal)); border-radius: 2px; transition: width 2s cubic-bezier(.4,0,.2,1); }

/* ── STEP INDICATOR ── */
.step-indicator {
  display: flex; align-items: center; gap: 0;
  margin-bottom: 28px; justify-content: center;
}
.step {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--head); font-size: 9px; letter-spacing: 2px;
  color: var(--muted); transition: color .3s;
}
.step.active { color: var(--green); }
.step.done   { color: var(--muted2); }
.step-num {
  width: 22px; height: 22px; border-radius: 50%;
  border: 1px solid currentColor;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; transition: background .3s, border-color .3s;
}
.step.active .step-num { background: rgba(0,230,118,.15); border-color: var(--green); }
.step.done   .step-num { background: rgba(0,230,118,.08); }
.step-connector {
  width: 32px; height: 1px;
  background: var(--border); margin: 0 4px;
}
.step-connector.done { background: var(--muted); }

/* ── REG SUMMARY ── */
.reg-summary {
  background: rgba(0,230,118,.03); border: 1px solid var(--border2); border-radius: 4px;
  padding: 14px 18px; margin-bottom: 20px; font-size: 11px; color: var(--muted2);
  line-height: 2; letter-spacing: 1px; font-family: var(--mono);
}
`;

function ordinal(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return s[(v-20)%10] || s[v] || s[0];
}

function genRegId() {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return 'REG-' + ts + rand;
}

const AGENT_ROLES = ['Team Lead', 'Field Operative', 'Tech Specialist', 'Tactical Support'];

export default function Register() {
  const [teamName, setTeamName] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [agents, setAgents] = useState([
    { name: '', usn: '' },
    { name: '', usn: '' },
    { name: '', usn: '' },
    { name: '', usn: '' },
  ]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [barWidth, setBarWidth] = useState(0);

  const size = parseInt(teamSize) || 0;

  const updateAgent = (i, field, value) => {
    setAgents(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const clearErrors = () => setErrors({});

  const validate = () => {
    const errs = {};
    if (!teamName.trim()) errs['team-name'] = '// squad codename required';
    if (!department) errs['department'] = '// select your department';
    if (!year) errs['year'] = '// select your year';
    if (!size) errs['team-size'] = '// select team size';
    for (let i = 1; i <= size; i++) {
      if (!agents[i-1].name.trim()) errs[`name-${i}`] = '// agent name required';
      if (!agents[i-1].usn.trim()) errs[`usn-${i}`] = '// USN required';
      else if (!/^[A-Za-z0-9]{7,15}$/.test(agents[i-1].usn.trim())) errs[`usn-${i}`] = '// invalid USN format';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    clearErrors();
    if (!validate()) return;

    setLoading(true);
    const regId = genRegId();

    const agentList = [];
    for (let i = 0; i < size; i++) {
      agentList.push({
        name: agents[i].name.trim(),
        usn: agents[i].usn.trim().toUpperCase(),
      });
    }

    const entry = {
      reg_id: regId,
      team_name: teamName.trim(),
      department,
      year: parseInt(year),
      agents: agentList,
    };

    try {
      const response = await fetch('/api/register-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });

      const result = await response.json();

      if (!response.ok) {
        alert('Registration failed: ' + (result.error || 'Unknown error'));
        setLoading(false);
        return;
      }

      setSuccessData(regId);
      setTimeout(() => setBarWidth(100), 100);
    } catch (e) {
      console.error('Registration error:', e);
      alert('Registration error: ' + e.message);
      setLoading(false);
    }
  };

  // Build summary for preview
  const hasSummaryData = teamName || department;
  const summaryAgentLines = [];
  for (let i = 1; i <= size; i++) {
    const n = agents[i-1].name.trim();
    const u = agents[i-1].usn.trim().toUpperCase();
    if (n || u) {
      summaryAgentLines.push({ i, n: n || '—', u: u || '—' });
    }
  }
  const showSummary = hasSummaryData && summaryAgentLines.length > 0;

  return (
    <>
      <Head>
        <title>CODE HEIST — AGENT RECRUITMENT</title>
        <meta name="description" content="Register your squad for CODE HEIST — the ultimate Java & OOP challenge." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: registerStyles }} />
      </Head>

      {/* SUCCESS OVERLAY */}
      <div className={`success-overlay${successData ? ' show' : ''}`} id="success-overlay">
        <div className="success-title">SQUAD ENLISTED</div>
        <div className="success-sub">Welcome to the Heist</div>
        {successData && <div className="success-id">{successData}</div>}
        <div className="success-msg">
          Your crew has been cleared for infiltration. Stand by for the mission briefing.<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'normal' }}>Inherit the Clues · Override the Competition</em>
        </div>
        <div className="success-bar">
          <div className="success-bar-fill" style={{ width: `${barWidth}%` }}></div>
        </div>
      </div>

      {/* LASER GRID */}
      <div className="laser-grid">
        <div className="grid-floor"></div>
        <div className="grid-ceil"></div>
        <div className="laser-sweep"></div>
        <div className="laser-sweep"></div>
        <div className="laser-sweep"></div>
        <div className="laser-h"></div>
        <div className="laser-h"></div>
      </div>

      <div className="glow-center"></div>
      <div className="glow-amber"></div>
      <div className="skyline"></div>
      <div className="particles">
        <div className="particle"></div><div className="particle"></div>
        <div className="particle"></div><div className="particle"></div>
        <div className="particle"></div><div className="particle"></div>
      </div>

      {/* MAIN PAGE */}
      <div className="page">

        {/* HEADER */}
        <div className="header">
          <div className="classified-badge">⚠ AGENT RECRUITMENT ⚠</div>
          <div className="logo">CODE HEIST</div>
          <div className="presenter-sub">
            <span className="pre-label">presented by</span>
            <span className="pre-name">Java &amp; OOP Community</span>
          </div>
          <div className="logo-sub">Inherit the Clues &nbsp;·&nbsp; Override the Competition</div>
          <div className="divider"></div>
        </div>

        {/* MISSION BRIEF */}
        <div className="mission-brief">
          <div className="brief-label">OPERATION BRIEFING</div>
          <div className="brief-text">
            The vault is sealed. The clock is running. Four levels of <span>Java &amp; OOP</span> mastery stand between your crew and the ultimate heist.
            To gain clearance, you must register your squad below. Each team must have <em>2–4 agents</em>.
            Once enlisted, your team credentials will be issued by the organizers.
            <br /><br />
            <em>// Only registered agents may participate. No walk-ins on the day of the operation.</em>
          </div>
        </div>

        {/* REGISTRATION FORM CARD */}
        <div className="terminal-card">
          <div className="terminal-bar">
            <div className="t-dot red"></div>
            <div className="t-dot amber"></div>
            <div className="t-dot green"></div>
            <div className="terminal-bar-title">SQUAD REGISTRATION TERMINAL</div>
          </div>

          <div className="card-body">

            {/* STEP INDICATOR */}
            <div className="step-indicator">
              <div className="step active" id="step1-ind">
                <div className="step-num">1</div>SQUAD INFO
              </div>
              <div className="step-connector"></div>
              <div className="step active" id="step2-ind">
                <div className="step-num">2</div>AGENTS
              </div>
              <div className="step-connector"></div>
              <div className="step active" id="step3-ind">
                <div className="step-num">3</div>CONFIRM
              </div>
            </div>

            {/* ── SECTION 1: SQUAD INFO ── */}
            <div className="section-label">SQUAD IDENTITY</div>

            <div className="form-row cols-2">
              <div className="field">
                <label className="field-label" htmlFor="team-name">Team Name</label>
                <div className="field-hint">// Your crew&apos;s codename for the operation</div>
                <div className="input-wrap">
                  <input
                    type="text"
                    id="team-name"
                    placeholder="e.g.  NULL POINTERS"
                    autoComplete="off"
                    spellCheck={false}
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    className={errors['team-name'] ? 'error' : ''}
                  />
                </div>
                <div className="field-error">{errors['team-name'] || ''}</div>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="department">Department</label>
                <div className="field-hint">// Your academic division</div>
                <div className="select-wrap">
                  <select
                    id="department"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className={errors['department'] ? 'error' : ''}
                  >
                    <option value="" disabled>— SELECT DEPT —</option>
                    <option value="CSE">CSE</option>
                    <option value="ISE">ISE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                    <option value="AIDS">AIDS</option>
                    <option value="AIML">AIML</option>
                    <option value="CSD">CSD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="field-error">{errors['department'] || ''}</div>
              </div>
            </div>

            <div className="form-row cols-2">
              <div className="field">
                <label className="field-label" htmlFor="year">Year</label>
                <div className="field-hint">// Current academic year of most members</div>
                <div className="select-wrap">
                  <select
                    id="year"
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    className={errors['year'] ? 'error' : ''}
                  >
                    <option value="" disabled>— SELECT YEAR —</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div className="field-error">{errors['year'] || ''}</div>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="team-size">Team Size</label>
                <div className="field-hint">// Number of agents in your crew (2–4)</div>
                <div className="select-wrap">
                  <select
                    id="team-size"
                    value={teamSize}
                    onChange={e => setTeamSize(e.target.value)}
                    className={errors['team-size'] ? 'error' : ''}
                  >
                    <option value="" disabled>— SELECT SIZE —</option>
                    <option value="2">2 Agents</option>
                    <option value="3">3 Agents</option>
                    <option value="4">4 Agents</option>
                  </select>
                </div>
                <div className="field-error">{errors['team-size'] || ''}</div>
              </div>
            </div>

            <div className="section-divider"></div>

            {/* ── SECTION 2: AGENT PROFILES ── */}
            <div className="section-label">AGENT PROFILES</div>

            <div id="agents-container">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="agent-card"
                  id={`agent-card-${i + 1}`}
                  style={{ display: i < size ? 'block' : 'none' }}
                >
                  <div className="agent-card-header">
                    <div className="agent-number">AGENT-{String(i + 1).padStart(2, '0')}</div>
                    <div className="agent-role">// {AGENT_ROLES[i]}</div>
                  </div>
                  <div className="form-row cols-2">
                    <div className="field">
                      <label className="field-label" htmlFor={`name-${i+1}`}>Full Name</label>
                      <div className="field-hint">// Agent&apos;s real identity</div>
                      <div className="input-wrap">
                        <input
                          type="text"
                          id={`name-${i+1}`}
                          placeholder={`e.g.  ${['ALEX CIPHER','MORGAN STACK','CASEY RUNTIME','RILEY BYTECODE'][i]}`}
                          autoComplete="off"
                          spellCheck={false}
                          value={agents[i].name}
                          onChange={e => updateAgent(i, 'name', e.target.value)}
                          className={errors[`name-${i+1}`] ? 'error' : ''}
                        />
                      </div>
                      <div className="field-error">{errors[`name-${i+1}`] || ''}</div>
                    </div>
                    <div className="field">
                      <label className="field-label" htmlFor={`usn-${i+1}`}>USN</label>
                      <div className="field-hint">// University Serial Number</div>
                      <div className="input-wrap">
                        <input
                          type="text"
                          id={`usn-${i+1}`}
                          placeholder={`e.g.  1XX22CS00${i+1}`}
                          autoComplete="off"
                          spellCheck={false}
                          style={{ textTransform: 'uppercase' }}
                          value={agents[i].usn}
                          onChange={e => updateAgent(i, 'usn', e.target.value.toUpperCase())}
                          className={errors[`usn-${i+1}`] ? 'error' : ''}
                        />
                      </div>
                      <div className="field-error">{errors[`usn-${i+1}`] || ''}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-divider"></div>

            {/* ── SECTION 3: CONFIRM & ENLIST ── */}
            <div className="section-label">CONFIRM &amp; ENLIST</div>

            {/* Summary preview */}
            {showSummary && (
              <div className="reg-summary">
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: 'var(--green)', letterSpacing: '3px' }}>{teamName || '—'}</span>
                  &nbsp;·&nbsp; {department || '—'} &nbsp;·&nbsp; {year ? `${year}${ordinal(parseInt(year))} Year` : '—'}
                </div>
                {summaryAgentLines.map(({ i, n, u }) => (
                  <div key={i}>
                    AGENT-0{i} &nbsp;·&nbsp; <span style={{ color: 'var(--green3)' }}>{n}</span> &nbsp;|&nbsp; <span style={{ color: 'var(--amber)' }}>{u}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              className="btn-submit"
              id="enlist-btn"
              disabled={loading}
              onClick={handleSubmit}
            >
              <span>{loading ? '◆ ENLISTING... ◆' : '⬡ \u00a0 ENLIST YOUR SQUAD \u00a0 ⬡'}</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '10px', color: 'var(--muted)', letterSpacing: '2px', lineHeight: '1.8' }}>
              // By enlisting, your squad agrees to uphold the code of conduct.<br />
              Once registered, team credentials will be shared by the organizers.
            </div>

          </div>

          <div className="card-footer">
            <div className="footer-code">SYS::REG_v1.0.0 &nbsp;|&nbsp; Java &amp; OOP Community</div>
            <div className="footer-secure">🔒 SECURE</div>
          </div>
        </div>

        <div className="team-badge">
          <div className="team-badge-dot"></div>
          RECRUITMENT PORTAL ACTIVE &nbsp;|&nbsp; ACCEPTING SQUADS
        </div>

      </div>
    </>
  );
}
