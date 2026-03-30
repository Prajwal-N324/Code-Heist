import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Verify password
    if (password === 'admin2025') {
      // Store authentication token in localStorage
      localStorage.setItem('admin_auth', 'true')
      localStorage.setItem('adminAuthTime', new Date().getTime().toString())

      // Redirect to admin dashboard
      setTimeout(() => {
        router.push('/admin')
      }, 500)
    } else {
      setError('Invalid access code. Access denied.')
      setPassword('')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>ADMIN ACCESS — CODE HEIST</title>
        <meta name="description" content="Admin credentials required." />
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <section className="admin-login-container">
        {/* Background */}
        <div className="bg-scene" />
        <div className="particles">
          {[...Array(6)].map((_, i) => <div key={i} className="particle" />)}
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="lock-icon">🔐</div>
          <h1 className="login-title">ADMIN ACCESS</h1>
          <p className="login-subtitle">Enter Access Code</p>

          <form onSubmit={handleLogin} className="login-form">
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password-input"
              disabled={loading}
              autoFocus
            />

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="access-btn" disabled={loading}>
              {loading ? 'VERIFYING...' : 'GRANT ACCESS'}
            </button>
          </form>

          <div className="login-footer">
            <p className="footer-text">Unauthorized access is tracked and logged</p>
            <a href="/" className="back-link">← Return to Gateway</a>
          </div>
        </div>

        <div className="glow-effect" />
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
          --red:     #ff5252;
          --amber:   #ffab40;
          --blue:    #40c4ff;
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

        /* Background */
        .bg-scene {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background: linear-gradient(135deg, rgba(0,230,118,0.03) 0%, rgba(64,196,255,0.02) 100%);
        }

        .bg-scene::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(90deg,
              transparent 0px, transparent 46px,
              rgba(0,230,118,0.015) 46px, rgba(0,230,118,0.015) 48px
            ),
            repeating-linear-gradient(180deg,
              transparent 0px, transparent 46px,
              rgba(0,230,118,0.015) 46px, rgba(0,230,118,0.015) 48px
            );
          animation: gridmove 20s linear infinite;
        }

        @keyframes gridmove {
          0% { background-position: 0 0; }
          100% { background-position: 0 48px; }
        }

        /* Particles */
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

        .particle:nth-child(1) { left: 10%; animation-duration: 10s; animation-delay: 0s; }
        .particle:nth-child(2) { left: 25%; animation-duration: 12s; animation-delay: 2s; background: var(--blue); }
        .particle:nth-child(3) { left: 40%; animation-duration: 9s; animation-delay: 1s; }
        .particle:nth-child(4) { left: 60%; animation-duration: 11s; animation-delay: 3s; background: var(--amber); }
        .particle:nth-child(5) { left: 75%; animation-duration: 10s; animation-delay: 1.5s; }
        .particle:nth-child(6) { left: 88%; animation-duration: 12s; animation-delay: 4s; background: var(--blue); }

        @keyframes float-up {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
        }

        /* Container */
        .admin-login-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1;
        }

        /* Glow */
        .glow-effect {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          pointer-events: none;
          background: radial-gradient(circle, rgba(0,230,118,0.08) 0%, transparent 70%);
          animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }

        /* Login Card */
        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 380px;
          background: var(--bg2);
          border: 1px solid var(--border2);
          border-radius: 8px;
          padding: 40px 32px;
          backdrop-filter: blur(10px);
          box-shadow: 0 0 40px rgba(0,230,118,0.1);
        }

        .lock-icon {
          font-size: 48px;
          margin-bottom: 16px;
          animation: lock-swing 2s ease-in-out infinite;
        }

        @keyframes lock-swing {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
        }

        .login-title {
          font-family: var(--head);
          font-size: 28px;
          font-weight: 900;
          color: var(--green);
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-bottom: 8px;
          text-shadow: 0 0 20px rgba(0,230,118,0.3);
        }

        .login-subtitle {
          font-family: var(--ui);
          font-size: 12px;
          color: var(--muted2);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 32px;
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .password-input {
          width: 100%;
          padding: 12px 16px;
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--green);
          font-family: var(--mono);
          font-size: 14px;
          letter-spacing: 2px;
          transition: all 0.3s;
          caret-color: var(--green);
        }

        .password-input:focus {
          outline: none;
          border-color: var(--green);
          box-shadow: 0 0 20px rgba(0,230,118,0.2);
          background: rgba(0,230,118,0.02);
        }

        .password-input::placeholder {
          color: var(--muted);
          letter-spacing: 2px;
        }

        .password-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Error Message */
        .error-message {
          padding: 12px 14px;
          background: rgba(255,82,82,0.08);
          border: 1px solid rgba(255,82,82,0.3);
          border-radius: 4px;
          color: var(--red);
          font-family: var(--ui);
          font-size: 12px;
          letter-spacing: 0.5px;
          animation: shake 0.4s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        /* Access Button */
        .access-btn {
          padding: 14px 20px;
          background: var(--green);
          color: var(--bg);
          border: none;
          border-radius: 4px;
          font-family: var(--head);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 0 20px rgba(0,230,118,0.3);
          margin-top: 8px;
        }

        .access-btn:hover:not(:disabled) {
          background: #00ffaa;
          box-shadow: 0 0 40px rgba(0,230,118,0.6);
          transform: translateY(-2px);
        }

        .access-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .access-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Footer */
        .login-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
          text-align: center;
        }

        .footer-text {
          font-family: var(--ui);
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 1px;
          margin-bottom: 12px;
          text-transform: uppercase;
        }

        .back-link {
          display: inline-block;
          font-family: var(--mono);
          font-size: 11px;
          color: var(--blue);
          text-decoration: none;
          transition: all 0.3s;
          letter-spacing: 1px;
        }

        .back-link:hover {
          color: var(--green);
          text-shadow: 0 0 10px rgba(0,230,118,0.3);
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 32px 24px;
            max-width: 100%;
          }

          .login-title {
            font-size: 24px;
          }
        }
      `}</style>
    </>
  )
}
