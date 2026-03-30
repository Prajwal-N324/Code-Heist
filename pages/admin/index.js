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
        <title>Admin Hub — Code Heist</title>
        <meta name="description" content="Admin control center for Code Heist operations." />
      </Head>

      <section className="admin-page">
        <div className="admin-hero">
          <div>
            <p className="eyebrow">ADMIN HUB</p>
            <h1>Operational command for the Code Heist event.</h1>
            <p>
              Coordinate recruits, monitor live progress, and dispatch new agents from a secure control
              panel built for festival deployment.
            </p>
          </div>
          <div className="admin-actions">
            <Link href="/admin/register" className="primary-btn">
              RECRUIT AGENTS
            </Link>
            <Link href="/" className="ghost-btn">
              RETURN TO GATEWAY
            </Link>
          </div>
        </div>

        <div className="admin-grid">
          <article className="glass-panel">
            <h2>Live Ops</h2>
            <p>Track incoming teams, verify entry points, and keep the mission flow secure.</p>
            <ul>
              <li>Event-safe mode enabled</li>
              <li>Realtime leaderboard telemetry</li>
              <li>Agent recruitment workflow</li>
            </ul>
          </article>

          <article className="glass-panel">
            <h2>System Status</h2>
            <div className="status-pill status-online">ONLINE</div>
            <p>Game engine ready. AI fallback logic is active when external services are offline.</p>
          </article>

          <article className="glass-panel">
            <h2>Access Control</h2>
            <p>Admin registration is gated behind the hub. Recruit page is only available through this panel.</p>
          </article>
        </div>
      </section>
    </>
  )
}
