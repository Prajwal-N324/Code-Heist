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
        <title>ADMIN CONTROL | CODE HEIST</title>
        <meta name="description" content="Secure admin control node for Code Heist operations." />
      </Head>

      <main className="login-shell admin-shell">
        <div className="auth-browser admin-browser">
          <div className="auth-window-top">
            <span className="window-dot" />
            <span className="window-dot" />
            <span className="window-dot" />
            <span className="window-title">ADMIN CONTROL NODE</span>
          </div>

          <div className="auth-card">
            <div className="admin-card-head">
              <span className="admin-badge">ADMIN ACCESS</span>
              <h2>ADMIN CONTROL NODE</h2>
              <p className="field-meta">Secure gateway for operative recruitment, system supervision, and fallback monitoring.</p>
            </div>

            <div className="admin-panel-grid">
              <article className="glass-panel">
                <span className="panel-label">LIVE OPS</span>
                <h3>Realtime oversight</h3>
                <p>Track team ingress, verify passcodes, and keep the event moving without interruption.</p>
              </article>
              <article className="glass-panel">
                <span className="panel-label">SYSTEM STATUS</span>
                <h3>Operational</h3>
                <p>Local AI fallback is ready. The control node stays live during the festival deployment.</p>
              </article>
              <article className="glass-panel">
                <span className="panel-label">RECRUITMENT</span>
                <h3>Agent registry</h3>
                <p>Open the recruit workflow from here to register new operatives and manage active teams.</p>
              </article>
            </div>

            <div className="admin-actions-grid">
              <Link href="/admin/register" className="primary-btn full-width">
                RECRUIT AGENTS
              </Link>
              <Link href="/" className="ghost-btn full-width">
                RETURN TO GATEWAY
              </Link>
            </div>

            <div className="admin-status-footer">
              <span>NODE ACTIVE</span>
              <span className="status-separator">|</span>
              <span>FALLBACK READY</span>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
