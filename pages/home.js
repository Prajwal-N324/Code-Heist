import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>MISSION BRIEF | CODE HEIST</title>
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <section className="home-container">
        <div className="bg-scene" />
        <div className="particles">
          {[...Array(6)].map((_, i) => <div key={i} className="particle" />)}
        </div>

        <div className="content-wrap">
          <div className="classified-badge">🔒 Mission Briefing · Operative Eyes Only</div>
          
          <h1 className="section-title">THE OBJECTIVE</h1>
          
          <div className="film-intro-wrapper">
            <div className="film-strip-top">
              {[...Array(12)].map((_, i) => <div key={i} className="film-hole" />)}
            </div>
            <div className="film-frame">
              The city never sleeps. Neither does the <em>CODE HEIST system</em>.<br /><br />
              Four elite engineers locked down the most powerful codebase on the planet — each one burying a fragment of the master key inside a <strong>different OOP concept</strong>.<br /><br />
              You've been hired for one job: <strong>crack all four levels, collect the letters, assemble the key.</strong><br /><br />
              The clock is ticking. The AI guardian is watching. <em>Don't get caught.</em>
            </div>
            <div className="film-strip-bottom">
              {[...Array(12)].map((_, i) => <div key={i} className="film-hole" />)}
            </div>
          </div>

          <h2 className="section-subtitle">// SECTORS TO BREACH</h2>

          <div className="level-grid">
            <div className="lv-pill">
              <div className="lv-pill-icon">🔒</div>
              <div className="lv-data">
                <div className="lv-n">L-01</div>
                <div className="lv-name">Abstraction</div>
                <div className="lv-tag">trace public → private</div>
              </div>
            </div>
            <div className="lv-pill">
              <div className="lv-pill-icon">📦</div>
              <div className="lv-data">
                <div className="lv-n">L-02</div>
                <div className="lv-name">Encapsulation</div>
                <div className="lv-tag">follow the setters</div>
              </div>
            </div>
            <div className="lv-pill">
              <div className="lv-pill-icon">🧬</div>
              <div className="lv-data">
                <div className="lv-n">L-03</div>
                <div className="lv-name">Inheritance</div>
                <div className="lv-tag">child overrides parent</div>
              </div>
            </div>
            <div className="lv-pill">
              <div className="lv-pill-icon">🎭</div>
              <div className="lv-data">
                <div className="lv-n">L-04</div>
                <div className="lv-name">Polymorphism</div>
                <div className="lv-tag">same method, right class</div>
              </div>
            </div>
          </div>

          <div className="action-footer">
            <Link href="/login" className="initiate-btn">INITIATE BREACH</Link>
            <Link href="/" className="back-link">← RETURN TO GATEWAY</Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        :root {
          --bg: #05080a;
          --green: #00e676;
          --amber: #ffab40;
          --text: #cfd8dc;
          --mono: 'Share Tech Mono', monospace;
          --head: 'Orbitron', monospace;
          --ui: 'Rajdhani', sans-serif;
        }

        .home-container {
          position: relative;
          min-height: 100vh;
          background: #05080a;
          color: #cfd8dc;
          font-family: var(--mono);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 60px 20px;
          overflow-x: hidden;
        }

        .bg-scene {
          position: fixed;
          inset: 0;
          background: 
            radial-gradient(ellipse at 50% 30%, rgba(0, 230, 118, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 70%, rgba(255, 171, 64, 0.04) 0%, transparent 70%);
          pointer-events: none;
        }

        .content-wrap {
          position: relative;
          z-index: 10;
          max-width: 900px;
          width: 100%;
          text-align: center;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .classified-badge {
          display: inline-block;
          border: 1px solid #ff5252;
          color: #ff5252;
          font-family: var(--head);
          font-size: 10px;
          letter-spacing: 3px;
          padding: 8px 20px;
          margin-bottom: 32px;
          text-transform: uppercase;
          animation: pulse-badge 2s ease-in-out infinite;
        }

        @keyframes pulse-badge {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        .section-title {
          font-family: var(--head);
          font-size: clamp(24px, 6vw, 36px);
          color: #fff;
          letter-spacing: 10px;
          margin-bottom: 48px;
          text-transform: uppercase;
          font-weight: 900;
        }

        .film-intro-wrapper {
          margin-bottom: 56px;
          animation: fadeInUp 1s ease-out 0.2s both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .film-strip-top, .film-strip-bottom {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin: 12px 0;
        }

        .film-hole {
          width: 22px;
          height: 14px;
          background: rgba(255, 171, 64, 0.08);
          border: 1px solid rgba(255, 171, 64, 0.25);
          border-radius: 2px;
          transition: all 0.3s;
        }

        .film-strip-top:hover .film-hole,
        .film-strip-bottom:hover .film-hole {
          background: rgba(255, 171, 64, 0.15);
          border-color: rgba(255, 171, 64, 0.4);
        }

        .film-frame {
          background: rgba(8, 13, 16, 0.7);
          border: 1.5px solid rgba(255, 171, 64, 0.4);
          padding: 48px 40px;
          font-family: var(--ui);
          font-size: clamp(15px, 2vw, 18px);
          line-height: 1.9;
          color: #90a4ae;
          text-align: center;
          border-radius: 6px;
          backdrop-filter: blur(10px);
          box-shadow: inset 0 1px 20px rgba(0, 230, 118, 0.05);
        }

        .film-frame em { color: var(--green); font-style: normal; font-weight: 700; }
        .film-frame strong { color: var(--amber); font-weight: 700; }

        .section-subtitle {
          font-family: var(--head);
          font-size: 12px;
          letter-spacing: 4px;
          color: var(--amber);
          margin-bottom: 36px;
          margin-top: 24px;
          text-transform: uppercase;
          opacity: 0.9;
        }

        .level-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 68px;
          width: 100%;
          animation: fadeInUp 1s ease-out 0.4s both;
        }

        .lv-pill {
          background: linear-gradient(135deg, rgba(8, 13, 16, 0.8) 0%, rgba(8, 13, 16, 0.5) 100%);
          border: 1.5px solid #112233;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }

        .lv-pill:hover {
          border-color: var(--green);
          transform: translateY(-8px);
          box-shadow: 
            0 20px 40px rgba(0, 230, 118, 0.15),
            inset 0 1px 15px rgba(0, 230, 118, 0.05);
          background: linear-gradient(135deg, rgba(8, 13, 16, 0.95) 0%, rgba(8, 13, 16, 0.7) 100%);
        }

        .lv-pill-icon { 
          font-size: 32px;
          transition: transform 0.3s;
        }

        .lv-pill:hover .lv-pill-icon {
          transform: scale(1.2) rotateZ(-10deg);
        }

        .lv-data { 
          text-align: center;
          width: 100%;
        }

        .lv-n { 
          font-size: 11px; 
          color: #546e7a; 
          margin-bottom: 6px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .lv-name { 
          font-family: var(--head); 
          font-size: 14px; 
          color: #fff; 
          margin-bottom: 8px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .lv-tag { 
          font-size: 11px; 
          color: #546e7a;
          font-style: italic;
        }

        .action-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
          margin-top: 20px;
          animation: fadeInUp 1s ease-out 0.6s both;
        }

        .initiate-btn {
          display: inline-block;
          background: linear-gradient(135deg, var(--green) 0%, #00c853 100%);
          color: #05080a;
          padding: 20px 70px;
          font-family: var(--head);
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 5px;
          text-decoration: none;
          border-radius: 6px;
          box-shadow: 
            0 0 30px rgba(0, 230, 118, 0.3),
            0 8px 24px rgba(0, 230, 118, 0.15);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-transform: uppercase;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .initiate-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shine 3s infinite;
        }

        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .initiate-btn:hover {
          transform: translateY(-4px);
          box-shadow: 
            0 0 50px rgba(0, 230, 118, 0.5),
            0 12px 32px rgba(0, 230, 118, 0.25);
        }

        .initiate-btn:active {
          transform: translateY(-2px);
        }

        .back-link {
          color: #546e7a;
          text-decoration: none;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .back-link:hover { 
          color: var(--blue);
          transform: translateX(-4px);
        }

        .particles {
          position: fixed;
          inset: 0;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: var(--green);
          border-radius: 50%;
          opacity: 0.3;
          animation: float 15s infinite linear;
        }

        @keyframes float {
          0% { transform: translateY(100vh); }
          100% { transform: translateY(-10vh); }
        }

        .particle:nth-child(1) { left: 10%; animation-duration: 12s; }
        .particle:nth-child(2) { left: 30%; animation-duration: 18s; background: var(--amber); }
        .particle:nth-child(3) { left: 50%; animation-duration: 14s; }
        .particle:nth-child(4) { left: 70%; animation-duration: 20s; background: var(--amber); }
        .particle:nth-child(5) { left: 90%; animation-duration: 16s; }

        @media (max-width: 768px) {
          .home-container {
            padding: 50px 16px;
          }

          .content-wrap {
            max-width: 100%;
          }

          .film-frame { 
            padding: 32px 24px; 
            font-size: 15px; 
            line-height: 1.7;
          }

          .level-grid { 
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 48px;
          }

          .lv-pill {
            padding: 20px 16px;
            gap: 12px;
          }

          .lv-pill-icon {
            font-size: 28px;
          }

          .section-title {
            font-size: 24px;
          }

          .initiate-btn {
            padding: 16px 50px;
            font-size: 12px;
            letter-spacing: 3px;
          }
        }

        @media (max-width: 480px) {
          .home-container {
            padding: 40px 12px;
          }

          .film-frame { 
            padding: 24px 16px; 
            font-size: 14px;
            line-height: 1.6;
          }

          .level-grid { 
            grid-template-columns: 1fr;
            gap: 14px;
            margin-bottom: 40px;
          }

          .lv-pill {
            padding: 18px 14px;
          }

          .classified-badge {
            font-size: 9px;
            padding: 6px 14px;
          }

          .section-title {
            font-size: 20px;
            letter-spacing: 6px;
            margin-bottom: 32px;
          }

          .initiate-btn {
            padding: 14px 40px;
            font-size: 11px;
            letter-spacing: 2px;
          }

          .back-link {
            font-size: 10px;
          }
        }
      `}</style>
    </>
  )
}