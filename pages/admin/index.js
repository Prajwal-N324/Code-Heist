import Head from 'next/head'
import Link from 'next/link'
import { useEffect } from 'react'

export default function AdminHub() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('admin_hub_access', 'true')
    }
  }, [])

  return (
    <>
      <Head>
        <title>ADMIN HUB | CODE HEIST</title>
        <meta name="description" content="Admin control center for Code Heist operations." />
      </Head>

      <section className="admin-page">
        <div className="admin-browser">
          <div className="auth-window-top">
            <span className="window-dot" />
            <span className="window-dot" />
            <span className="window-dot" />
            <span className="window-title">ADMIN ACCESS</span>
          </div>

          <div className="admin-card">
            <div className="admin-card-head">
              <p className="eyebrow">COMMAND INTERFACE</p>
              <h2>Control the festival deployment.</h2>
              <p>
                Use the secure admin hub to recruit new agents, supervise game flow, and keep the Code Heist mission
                moving safely.
              </p>
            </div>

            <div className="admin-actions admin-actions-vertical">
              <Link href="/admin/register" className="primary-btn">
                RECRUIT AGENTS
              </Link>
              <Link href="/" className="ghost-btn">
                RETURN TO GATEWAY
              </Link>
            </div>

            <div className="admin-summary-grid">
              <article className="glass-panel">
                <h3>Live Ops</h3>
                <p>Monitor the event in real time and validate access codes at every checkpoint.</p>
              </article>
              <article className="glass-panel">
                <h3>System Status</h3>
                <div className="status-pill status-online">ONLINE</div>
                <p>Fallback authentication is active if the external AI service becomes unavailable.</p>
              </article>
              <article className="glass-panel">
                <h3>Recruitment</h3>
                <p>The recruit page is gated behind this hub and only available through admin access.</p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
