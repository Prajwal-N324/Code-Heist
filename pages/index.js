import Head from 'next/head'
import Link from 'next/link'

export default function Landing() {
  return (
    <>
      <Head>
        <title>CODE HEIST — Inherit the Clues, Override the Competition</title>
        <meta name="description" content="Enter the CODE HEIST system. Four levels of OOP mastery await." />
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <section className="landing-container">
        <div className="bg-scene" />
        <div className="particles">
          {[...Array(6)].map((_, i) => <div key={i} className="particle" />)}
        </div>

        <div className="admin-corner">
          <Link href="/admin/login" className="admin-btn">
            ADMIN ACCESS
          </Link>
        </div>

        <div className="land-glow" />

        <div className="land-content">
          <div className="system-status">// SYSTEM ONLINE</div>
          <h1 className="nexus-logo">CODE HEIST</h1>
          <p className="logo-sub">VIGYAN.IO · JAVA & OOP CHALLENGE</p>
          
          <div className="land-line" />

          <div className="action-hub">
            <Link href="/auth-login" className="start-btn">
              LOGIN TO SYSTEM
            </Link>
            <Link href="/home" className="secondary-link">VIEW MISSION BRIEFING</Link>
          </div>
        </div>
      </section>

      <style jsx>{`
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
          --purple:  #b388ff;
          --teal:    #64ffda;
          --text:    #cfd8dc;
          --muted:   #37474f;
          --muted2:  #546e7a;
          --mono: 'Share Tech Mono', monospace;
          --ui:   'Rajdhani', sans-serif;
          --head: 'Orbitron', monospace;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--mono);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── CINEMATIC BACKGROUND ── */
        .bg-scene {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            linear-gradient(180deg, transparent 55%, rgba(0,10,5,0.85) 100%),
            linear-gradient(0deg, transparent 55%, rgba(0,10,5,0.6) 100%);
        }

        .bg-scene::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(90deg,
              transparent 0px, transparent 46px,
              rgba(0,230,118,0.018) 46px, rgba(0,230,118,0.018) 48px
            ),
            repeating-linear-gradient(180deg,
              transparent 0px, transparent 46px,
              rgba(0,230,118,0.018) 46px, rgba(0,230,118,0.018) 48px
            );
          animation: gridmove 20s linear infinite;
        }

        @keyframes gridmove {
          0% { background-position: 0 0; }
          100% { background-position: 0 48px; }
        }

        /* Film grain texture */
        .landing-container::after {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.35;
        }

        /* Scanlines */
        .landing-container::before {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,.05) 3px, rgba(0,0,0,.05) 4px);
        }

        .landing-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          text-align: center;
          z-index: 3;
        }

        /* Skyline */
        .skyline {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40vh;
          pointer-events: none;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 280' preserveAspectRatio='xMidYMax slice'%3E%3Cg fill='%23050a06'%3E%3Crect x='0' y='140' width='60' height='140'/%3E%3Crect x='30' y='100' width='40' height='180'/%3E%3Crect x='80' y='120' width='50' height='160'/%3E%3Crect x='140' y='80' width='30' height='200'/%3E%3Crect x='150' y='60' width='15' height='220'/%3E%3Crect x='180' y='130' width='70' height='150'/%3E%3Crect x='260' y='90' width='45' height='190'/%3E%3Crect x='315' y='110' width='35' height='170'/%3E%3Crect x='360' y='70' width='55' height='210'/%3E%3Crect x='370' y='40' width='10' height='240'/%3E%3Crect x='430' y='100' width='65' height='180'/%3E%3Crect x='510' y='120' width='40' height='160'/%3E%3Crect x='560' y='85' width='30' height='195'/%3E%3Crect x='600' y='60' width='50' height='220'/%3E%3Crect x='660' y='110' width='45' height='170'/%3E%3Crect x='715' y='90' width='60' height='190'/%3E%3Crect x='785' y='70' width='35' height='210'/%3E%3Crect x='830' y='100' width='55' height='180'/%3E%3Crect x='895' y='130' width='40' height='150'/%3E%3Crect x='945' y='80' width='50' height='200'/%3E%3Crect x='1005' y='110' width='65' height='170'/%3E%3Crect x='1080' y='90' width='30' height='190'/%3E%3Crect x='1120' y='60' width='45' height='220'/%3E%3Crect x='1175' y='120' width='55' height='160'/%3E%3Crect x='1240' y='80' width='40' height='200'/%3E%3Crect x='1290' y='100' width='60' height='180'/%3E%3Crect x='1360' y='70' width='80' height='210'/%3E%3C/g%3E%3Cg fill='%2300e676' opacity='0.15'%3E%3Crect x='154' y='52' width='4' height='8'/%3E%3Crect x='373' y='32' width='4' height='8'/%3E%3Crect x='603' y='52' width='4' height='8'/%3E%3Crect x='1123' y='52' width='4' height='8'/%3E%3C/g%3E%3C/svg%3E") no-repeat bottom;
          background-size: cover;
          opacity: 0.7;
        }

        /* Floating particles */
        .particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: var(--green);
          opacity: 0;
          animation: float-up linear infinite;
        }

        .particle:nth-child(1) { left: 10%; animation-duration: 12s; animation-delay: 0s; }
        .particle:nth-child(2) { left: 25%; animation-duration: 15s; animation-delay: 3s; background: var(--amber); }
        .particle:nth-child(3) { left: 40%; animation-duration: 10s; animation-delay: 1s; }
        .particle:nth-child(4) { left: 60%; animation-duration: 14s; animation-delay: 5s; background: var(--blue); }
        .particle:nth-child(5) { left: 75%; animation-duration: 11s; animation-delay: 2s; }
        .particle:nth-child(6) { left: 88%; animation-duration: 13s; animation-delay: 7s; background: var(--amber); }

        @keyframes float-up {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
        }

        .system-status {
          font-family: var(--head);
          font-size: 10px;
          color: var(--green);
          letter-spacing: 4px;
          margin-bottom: 16px;
          opacity: 0.8;
          animation: blink 2s infinite;
        }

        @keyframes blink { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

        /* Admin Corner Button */
        .admin-corner {
          position: fixed;
          top: 24px;
          left: 24px;
          z-index: 100;
        }

        .admin-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 16px;
          font-family: var(--head);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--muted);
          border: 1px solid var(--border);
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
        }

        .admin-btn:hover {
          color: var(--amber);
          border-color: var(--amber);
          box-shadow: 0 0 20px rgba(255, 171, 64, 0.3);
        }

        .action-hub {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        /* Main Content */
        .land-content {
          position: relative;
          z-index: 10;
          max-width: 700px;
          width: min(100%, 700px);
          margin: 0 auto;
        }

        /* Glows */
        .land-glow {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 800px;
          pointer-events: none;
          background: radial-gradient(ellipse at center, rgba(0,230,118,.09) 0%, rgba(0,100,60,.03) 40%, transparent 70%);
          animation: pglow 4s ease-in-out infinite;
        }

        .land-glow2 {
          position: fixed;
          top: 20%;
          right: 10%;
          width: 400px;
          height: 400px;
          pointer-events: none;
          background: radial-gradient(circle, rgba(255,171,64,.04) 0%, transparent 65%);
          animation: pglow2 7s ease-in-out infinite;
        }

        @keyframes pglow {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.12); }
        }

        @keyframes pglow2 {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.15); }
        }

        /* Classified Badge */
        .classified-badge {
          display: inline-block;
          border: 2px solid var(--red);
          color: var(--red);
          font-family: var(--head);
          font-size: 9px;
          letter-spacing: 5px;
          padding: 4px 16px;
          transform: rotate(-2deg);
          margin-bottom: 20px;
          opacity: 0.85;
          text-transform: uppercase;
        }

        /* Logo */
        .nexus-logo {
          font-family: var(--head);
          font-size: clamp(46px, 12vw, 100px);
          font-weight: 900;
          color: var(--green);
          letter-spacing: 8px;
          line-height: 1;
          text-shadow: 0 0 40px rgba(0,230,118,.5), 0 0 100px rgba(0,230,118,.25), 0 0 200px rgba(0,230,118,.1);
          animation: flk 10s infinite;
          margin: 0;
        }

        @keyframes flk {
          0%, 88%, 100% { opacity: 1; }
          89% { opacity: 0.65; }
          90% { opacity: 1; }
          93% { opacity: 0.45; }
          94% { opacity: 1; }
        }

        .logo-sub {
          font-family: var(--ui);
          font-size: clamp(10px, 2vw, 14px);
          color: var(--amber);
          letter-spacing: 4px;
          font-weight: 400;
          text-transform: uppercase;
          margin-top: 8px;
          margin-bottom: 60px;
          opacity: 0.8;
        }

        .land-line {
          width: 320px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--green2), var(--amber), var(--green2), transparent);
          margin: 0 auto 44px;
          opacity: 0.6;
        }

        .lv-pill-icon {
          font-size: 18px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .lv-n {
          font-family: var(--head);
          font-size: 9px;
          color: var(--muted);
          letter-spacing: 1px;
        }

        .lv-name {
          font-family: var(--ui);
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          margin: 2px 0;
        }

        .lv-tag {
          font-size: 10px;
          color: var(--muted);
          font-family: var(--ui);
        }

        .lv-key {
          font-size: 9px;
          color: var(--amber);
          font-family: var(--mono);
          margin-top: 4px;
          letter-spacing: 0.5px;
        }

        /* Start Button */
        .start-btn {
          display: inline-block;
          font-family: var(--head);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 5px;
          color: var(--bg);
          background: var(--green);
          border: none;
          padding: 18px 56px;
          border-radius: 4px;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.2s;
          box-shadow: 0 0 30px rgba(0,230,118,.4);
          animation: sbp 2.5s ease-in-out infinite;
          text-decoration: none;
          margin: 0 auto 22px;
        }

        @keyframes sbp {
          0%, 100% { box-shadow: 0 0 20px rgba(0,230,118,.3); }
          50% { box-shadow: 0 0 60px rgba(0,230,118,.7); }
        }

        .start-btn:hover {
          background: #00ffaa;
          transform: translateY(-2px);
          box-shadow: 0 0 80px rgba(0,230,118,.9);
        }

        .secondary-link {
          display: inline-block;
          color: var(--muted2);
          text-decoration: none;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: color 0.3s;
        }

        .secondary-link:hover { color: var(--blue); }

        @media (max-width: 480px) {
          .level-grid {
            grid-template-columns: 1fr;
          }

          .film-frame {
            padding: 16px 20px;
          }
        }
      `}</style>
    </>
  )
}
