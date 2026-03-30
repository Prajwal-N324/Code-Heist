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
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
          overflow-x: hidden;
        }

        .bg-scene {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(0, 230, 118, 0.05) 0%, transparent 80%);
          pointer-events: none;
        }

        .content-wrap {
          position: relative;
          z-index: 10;
          max-width: 800px;
          width: 100%;
          text-align: center;
        }

        .classified-badge {
          display: inline-block;
          border: 1px solid #ff5252;
          color: #ff5252;
          font-family: var(--head);
          font-size: 10px;
          letter-spacing: 3px;
          padding: 6px 16px;
          margin-bottom: 30px;
          text-transform: uppercase;
        }

        .section-title {
          font-family: var(--head);
          font-size: 28px;
          color: #fff;
          letter-spacing: 10px;
          margin-bottom: 40px;
        }

        .film-intro-wrapper {
          margin-bottom: 50px;
        }

        .film-strip-top, .film-strip-bottom {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin: 10px 0;
        }

        .film-hole {
          width: 20px;
          height: 12px;
          background: rgba(255, 171, 64, 0.05);
          border: 1px solid rgba(255, 171, 64, 0.2);
          border-radius: 2px;
        }

        .film-frame {
          background: rgba(8, 13, 16, 0.9);
          border: 1px solid rgba(255, 171, 64, 0.3);
          padding: 40px;
          font-family: var(--ui);
          font-size: 18px;
          line-height: 1.8;
          color: #90a4ae;
          text-align: center;
          border-radius: 4px;
        }

        .film-frame em { color: var(--green); font-style: normal; font-weight: 600; }
        .film-frame strong { color: var(--amber); }

        .section-subtitle {
          font-family: var(--head);
          font-size: 12px;
          letter-spacing: 4px;
          color: var(--amber);
          margin-bottom: 24px;
        }

        .level-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 60px;
        }

        .lv-pill {
          background: rgba(8, 13, 16, 0.6);
          border: 1px solid #112233;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: all 0.3s;
        }

        .lv-pill:hover {
          border-color: var(--green);
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 230, 118, 0.1);
        }

        .lv-pill-icon { font-size: 24px; }
        .lv-data { text-align: center; }
        .lv-n { font-size: 10px; color: #546e7a; margin-bottom: 4px; }
        .lv-name { font-family: var(--head); font-size: 12px; color: #fff; margin-bottom: 4px; }
        .lv-tag { font-size: 10px; color: #546e7a; }

        .action-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .initiate-btn {
          display: inline-block;
          background: var(--green);
          color: #05080a;
          padding: 18px 60px;
          font-family: var(--head);
          font-weight: 700;
          letter-spacing: 4px;
          text-decoration: none;
          border-radius: 4px;
          box-shadow: 0 0 30px rgba(0, 230, 118, 0.3);
          transition: all 0.3s;
        }

        .initiate-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 50px rgba(0, 230, 118, 0.5);
        }

        .back-link {
          color: #546e7a;
          text-decoration: none;
          font-size: 11px;
          letter-spacing: 2px;
        }

        .back-link:hover { color: #fff; }

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

        @media (max-width: 600px) {
          .film-frame { padding: 20px; font-size: 15px; }
          .level-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </>
  )
}