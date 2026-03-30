import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminHub() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activityFeed, setActivityFeed] = useState([])
  const [editorRounds, setEditorRounds] = useState([])
  const [selectedRound, setSelectedRound] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [toast, setToast] = useState('')
  const [loadingActivity, setLoadingActivity] = useState(false)
  const [loadingEditor, setLoadingEditor] = useState(false)
  const [clearPending, setClearPending] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    sessionStorage.setItem('admin_hub_access', 'true')
    localStorage.setItem('admin_auth', 'true')
    fetchLiveActivity()
  }, [])

  useEffect(() => {
    if (!drawerOpen) return
    fetchEditorRounds()
  }, [drawerOpen])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const formatTime = (value) => {
    if (!value) return ''
    const date = new Date(value)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const fetchLiveActivity = async () => {
    setLoadingActivity(true)
    const { data, error } = await supabase
      .from('ch_leaderboard')
      .select('id,team_name,level,created_at')
      .order('created_at', { ascending: false })
      .limit(6)

    if (error || !data) {
      const { data: fallback, error: fallbackError } = await supabase
        .from('teams')
        .select('id,team_name,current_round,updated_at')
        .order('updated_at', { ascending: false })
        .limit(6)

      if (!fallbackError && fallback) {
        setActivityFeed(
          fallback.map((item) => ({
            id: item.id,
            title: item.team_name || 'Unknown Team',
            detail: `Live on round ${item.current_round || 1}`,
            time: item.updated_at || ''
          }))
        )
        setStatusMessage('Showing fallback team activity')
      } else {
        setActivityFeed([])
        setStatusMessage('Unable to load live activity')
      }
    } else {
      setActivityFeed(
        data.map((item) => ({
          id: item.id,
          title: item.team_name || 'Unknown Team',
          detail: `Solved level ${item.level || '?'}`,
          time: item.created_at || ''
        }))
      )
      setStatusMessage('')
    }

    setLoadingActivity(false)
  }

  const fetchEditorRounds = async () => {
    setLoadingEditor(true)
    const { data, error } = await supabase
      .from('rounds')
      .select('id,set_id,round_number,mission_title')
      .order('set_id', { ascending: true })
      .order('round_number', { ascending: true })
      .limit(12)

    if (!error && data) {
      setEditorRounds(data)
      if (!selectedRound && data.length) {
        setSelectedRound(data[0])
      }
    }
    setLoadingEditor(false)
  }

  const handleClearLeaderboard = async () => {
    if (!confirm('Confirm clear the live leaderboard? This action cannot be undone.')) return
    setClearPending(true)

    const { error } = await supabase.from('ch_leaderboard').delete().neq('id', '')
    if (error) {
      const { error: fallbackError } = await supabase
        .from('teams')
        .update({ score: 0, current_round: 1 })
        .neq('id', '')

      if (fallbackError) {
        setToast('Unable to clear leaderboard data.')
      } else {
        setToast('Leaderboard reset using fallback team data.')
      }
    } else {
      setToast('Leaderboard cleared successfully.')
    }

    setClearPending(false)
    fetchLiveActivity()
  }

  const handleSelectRound = (round) => {
    setSelectedRound(round)
  }

  return (
    <>
      <Head>
        <title>MISSION CONTROL | CODE HEIST</title>
        <meta name="description" content="Admin mission control dashboard for Code Heist." />
      </Head>

      <main className="dashboard-shell">
        <div className="dashboard-backdrop" />
        <div className="dashboard-content">
          <section className="hero-panel">
            <div>
              <div className="mission-title">
                <span className="live-dot" /> MISSION CONTROL // ADMIN
              </div>
              <h1>Command center for festival operations</h1>
              <p>
                Use the quick actions below to launch the live leaderboard, edit mission puzzles, recruit agents, and manage reset workflows.
              </p>
            </div>
            <div className="hero-meta">
              <div>
                <span>LIVE STATUS</span>
                <strong>ACTIVE</strong>
              </div>
              <div>
                <span>NETWORK</span>
                <strong>SECURE NODE</strong>
              </div>
            </div>
          </section>

          <section className="actions-panel">
            <div className="panel-title-row">
              <span className="panel-eyebrow">Quick Actions</span>
              <span className="panel-note">4 interactive command cards for mission control.</span>
            </div>
            <div className="actions-grid">
              <Link href="/admin/leaderboard" className="dashboard-card card-blue group">
                <div className="card-head">
                  <div className="card-icon card-icon-blue" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 21h8" />
                      <path d="M12 3l2.5 6.5 7.5 1-5.5 5.4 1.6 7.6L12 18.3 5.9 23 7.5 15.4 2 10l7.5-1L12 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="card-label">Leaderboard</p>
                    <h3>Live rankings</h3>
                  </div>
                </div>
                <span className="card-action">View rankings →</span>
              </Link>

              <button type="button" className="dashboard-card card-green group" onClick={() => setDrawerOpen(true)}>
                <div className="card-head">
                  <div className="card-icon card-icon-green" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 18V8a2 2 0 0 0-2-2H8" />
                      <path d="M8 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8" />
                      <path d="M16 6h4v4" />
                      <path d="M18 8l-4 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="card-label">Puzzle Editor</p>
                    <h3>Edit missions</h3>
                  </div>
                </div>
                <span className="card-action">Open editor →</span>
              </button>

              <Link href="/admin/register" className="dashboard-card card-amber group">
                <div className="card-head">
                  <div className="card-icon card-icon-amber" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                      <path d="M19 8v6" />
                      <path d="M22 11h-6" />
                    </svg>
                  </div>
                  <div>
                    <p className="card-label">Recruit Agents</p>
                    <h3>Build your crew</h3>
                  </div>
                </div>
                <span className="card-action">Add new operatives →</span>
              </Link>

              <button type="button" className="dashboard-card card-gray group" onClick={handleClearLeaderboard} disabled={clearPending}>
                <div className="card-head">
                  <div className="card-icon card-icon-gray" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </div>
                  <div>
                    <p className="card-label">System Reset</p>
                    <h3>Clear leaderboard</h3>
                  </div>
                </div>
                <span className="card-action">Reset now →</span>
              </button>
            </div>
          </section>

          <section className="activity-panel">
            <div className="panel-title-row">
              <span className="panel-eyebrow">Live Activity</span>
              <span className="panel-note">Streaming from Supabase</span>
            </div>
            <div className="activity-grid">
              {loadingActivity ? (
                <div className="activity-empty">Syncing live events…</div>
              ) : activityFeed.length ? (
                activityFeed.map((item) => (
                  <article key={item.id} className="activity-card">
                    <div>
                      <p className="activity-title">{item.title}</p>
                      <p className="activity-detail">{item.detail}</p>
                    </div>
                    <span className="activity-time">{formatTime(item.time)}</span>
                  </article>
                ))
              ) : (
                <div className="activity-empty">No live activity available.</div>
              )}
            </div>
            {statusMessage ? <p className="status-message">{statusMessage}</p> : null}
          </section>
        </div>

        {drawerOpen ? (
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
            <aside className="editor-drawer" onClick={(event) => event.stopPropagation()}>
              <div className="drawer-header">
                <div>
                  <p className="drawer-eyebrow">Puzzle Editor</p>
                  <h2>Mission definitions</h2>
                </div>
                <button className="drawer-close" type="button" onClick={() => setDrawerOpen(false)}>
                  ×
                </button>
              </div>

              <div className="drawer-body">
                <div className="editor-summary">
                  <p>Browse the current round catalog and select a mission to inspect its title.</p>
                  <span>{loadingEditor ? 'Loading rounds…' : `${editorRounds.length} rounds available`}</span>
                </div>

                <div className="editor-grid">
                  <div className="editor-list">
                    {editorRounds.length > 0 ? (
                      editorRounds.map((round) => (
                        <button
                          key={round.id}
                          type="button"
                          className={`editor-item ${selectedRound?.id === round.id ? 'active' : ''}`}
                          onClick={() => handleSelectRound(round)}
                        >
                          <span>SET {round.set_id}</span>
                          <strong>{round.mission_title || `Round ${round.round_number}`}</strong>
                        </button>
                      ))
                    ) : (
                      <div className="editor-empty">No rounds available yet.</div>
                    )}
                  </div>
                  <div className="editor-preview">
                    {selectedRound ? (
                      <>
                        <div className="preview-badge">
                          SET {selectedRound.set_id} · ROUND {selectedRound.round_number}
                        </div>
                        <h3>{selectedRound.mission_title || 'Untitled mission'}</h3>
                        <p>Use the full admin editor at <strong>/admin/leaderboard</strong> to update puzzles and mission data.</p>
                      </>
                    ) : (
                      <div className="editor-empty">Select a round to preview mission details.</div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : null}

        {toast ? <div className="toast-banner">{toast}</div> : null}
      </main>

      <style jsx>{`
        .dashboard-shell {
          position: relative;
          min-height: 100vh;
          background: #05080a;
          color: #cfd8dc;
          overflow: hidden;
        }

        .dashboard-backdrop {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top center, rgba(16, 208, 255, 0.14), transparent 32%),
            radial-gradient(circle at 20% 10%, rgba(255, 66, 134, 0.12), transparent 22%),
            linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 60%),
            repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255, 255, 255, 0.04) 4px, rgba(255, 255, 255, 0.04) 5px);
          pointer-events: none;
          opacity: 0.8;
        }

        .dashboard-content {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 32px 80px;
          display: grid;
          gap: 36px;
        }

        .hero-panel {
          display: grid;
          gap: 26px;
          padding: 32px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          backdrop-filter: blur(18px);
          background: rgba(1, 7, 14, 0.72);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
        }

        .mission-title {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #ffffff;
          font-family: var(--mono);
          font-size: 0.78rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }

        .live-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #ff3f61;
          box-shadow: 0 0 0 rgba(255, 63, 97, 0.8);
          animation: pulse 1.8s infinite ease-in-out;
        }

        .hero-panel h1 {
          margin: 0;
          font-size: clamp(2.4rem, 3.5vw, 4rem);
          line-height: 1.03;
          letter-spacing: -0.04em;
          color: #f4f7fb;
          max-width: 820px;
        }

        .hero-panel p {
          margin: 0;
          color: rgba(223, 232, 240, 0.78);
          max-width: 760px;
          line-height: 1.9;
          font-size: 1rem;
        }

        .hero-meta {
          display: grid;
          grid-template-columns: repeat(2, minmax(180px, 1fr));
          gap: 18px;
        }

        .hero-meta div {
          padding: 18px 22px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .hero-meta span {
          display: block;
          color: rgba(207, 216, 220, 0.7);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 0.72rem;
          margin-bottom: 8px;
        }

        .hero-meta strong {
          display: block;
          color: #e8f9ff;
          font-size: 1.15rem;
        }

        .panel-title-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .panel-eyebrow {
          color: #8af7ff;
          font-family: var(--mono);
          font-size: 0.8rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
        }

        .panel-note {
          color: rgba(207, 216, 220, 0.66);
          font-size: 0.9rem;
        }

        .actions-panel,
        .activity-panel {
          padding: 28px;
          border-radius: 28px;
          background: rgba(1, 7, 14, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(18px);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(220px, 1fr));
          gap: 20px;
        }

        .dashboard-card {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 220px;
          padding: 28px;
          border-radius: 28px;
          color: #f8fbff;
          text-decoration: none;
          transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background-size: 200% 200%;
        }

        .dashboard-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 0 30px rgba(0, 230, 118, 0.28);
        }

        .dashboard-card:disabled,
        .dashboard-card[disabled] {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .dashboard-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.12;
          pointer-events: none;
          background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.22), transparent 35%);
        }

        .card-head {
          display: flex;
          align-items: center;
          gap: 18px;
          position: relative;
          z-index: 1;
        }

        .card-icon {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.12);
          color: inherit;
        }

        .card-icon svg {
          width: 28px;
          height: 28px;
        }

        .card-label {
          margin: 0;
          color: rgba(255, 255, 255, 0.75);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 0.72rem;
          font-family: var(--mono);
        }

        .dashboard-card h3 {
          margin: 10px 0 0;
          color: #ffffff;
          font-size: 1.25rem;
          line-height: 1.2;
        }

        .card-action {
          margin-top: 28px;
          color: rgba(255, 255, 255, 0.85);
          font-family: var(--mono);
          letter-spacing: 0.18em;
          font-size: 0.85rem;
        }

        .card-blue {
          background: linear-gradient(135deg, #2c8cff 0%, #8b5cff 100%);
        }

        .card-green {
          background: linear-gradient(135deg, #45f089 0%, #00c3d7 100%);
        }

        .card-amber {
          background: linear-gradient(135deg, #ffc84d 0%, #ff6a4c 100%);
        }

        .card-gray {
          background: linear-gradient(135deg, #1f262e 0%, #2d333d 100%);
        }

        .card-icon-blue {
          background: rgba(255, 255, 255, 0.16);
        }

        .card-icon-green {
          background: rgba(255, 255, 255, 0.14);
        }

        .card-icon-amber {
          background: rgba(255, 255, 255, 0.14);
        }

        .card-icon-gray {
          background: rgba(255, 255, 255, 0.1);
        }

        .activity-grid {
          display: grid;
          gap: 14px;
        }

        .activity-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 18px 22px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .activity-title {
          margin: 0 0 6px;
          font-size: 1rem;
          color: #eef9ff;
        }

        .activity-detail {
          margin: 0;
          color: rgba(207, 216, 220, 0.78);
          font-size: 0.95rem;
          line-height: 1.7;
        }

        .activity-time {
          color: rgba(207, 216, 220, 0.7);
          font-family: var(--mono);
          font-size: 0.8rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .activity-empty,
        .editor-empty {
          color: rgba(207, 216, 220, 0.68);
          font-size: 0.95rem;
          padding: 24px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .status-message {
          margin-top: 16px;
          color: rgba(173, 211, 236, 0.88);
          font-size: 0.92rem;
        }

        .drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 30;
          background: rgba(1, 7, 14, 0.8);
          backdrop-filter: blur(8px);
          display: grid;
          place-items: end center;
          padding: 24px;
        }

        .editor-drawer {
          width: min(620px, 100%);
          max-height: 100vh;
          background: rgba(6, 12, 22, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          padding: 28px;
          display: grid;
          gap: 22px;
          overflow: hidden;
          box-shadow: 0 40px 120px rgba(0, 0, 0, 0.35);
          transform: translateX(0);
          animation: slideIn 0.35s ease forwards;
        }

        .drawer-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }

        .drawer-eyebrow {
          font-family: var(--mono);
          color: #7bf5ff;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          font-size: 0.75rem;
          margin-bottom: 10px;
        }

        .drawer-header h2 {
          margin: 0;
          color: #f6fbff;
          font-size: 1.95rem;
        }

        .drawer-close {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          font-size: 1.8rem;
          line-height: 1;
          cursor: pointer;
        }

        .drawer-body {
          display: grid;
          gap: 20px;
        }

        .editor-summary {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 22px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .editor-summary p {
          margin: 0;
          color: rgba(223, 232, 240, 0.86);
          line-height: 1.8;
        }

        .editor-summary span {
          color: #8af7ff;
          font-family: var(--mono);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 0.78rem;
        }

        .editor-grid {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 18px;
          min-height: 300px;
        }

        .editor-list {
          display: grid;
          gap: 12px;
          overflow-y: auto;
          max-height: 520px;
          padding-right: 4px;
        }

        .editor-item {
          width: 100%;
          text-align: left;
          padding: 18px 20px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #e9f4ff;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          display: grid;
          gap: 8px;
        }

        .editor-item:hover,
        .editor-item.active {
          transform: translateY(-2px);
          border-color: rgba(73, 193, 255, 0.55);
          box-shadow: 0 16px 40px rgba(0, 180, 255, 0.12);
        }

        .editor-item span {
          color: rgba(156, 228, 255, 0.75);
          font-family: var(--mono);
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .editor-item strong {
          display: block;
          color: #ffffff;
          font-size: 0.98rem;
        }

        .editor-preview {
          padding: 22px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          min-height: 260px;
        }

        .preview-badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(72, 190, 255, 0.12);
          color: #8bf7ff;
          font-family: var(--mono);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 0.75rem;
          margin-bottom: 18px;
        }

        .editor-preview h3 {
          margin: 0 0 14px;
          color: #f9fdff;
          font-size: 1.4rem;
        }

        .editor-preview p {
          margin: 0;
          line-height: 1.85;
          color: rgba(223, 232, 240, 0.82);
        }

        .toast-banner {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 40;
          padding: 14px 22px;
          border-radius: 16px;
          background: rgba(0, 230, 118, 0.14);
          color: #d8ffee;
          font-family: var(--mono);
          letter-spacing: 0.12em;
          box-shadow: 0 18px 40px rgba(0, 160, 120, 0.18);
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.75; }
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @media (max-width: 1100px) {
          .actions-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .editor-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 780px) {
          .dashboard-content {
            padding: 28px 20px 60px;
          }

          .hero-panel {
            padding: 24px;
          }

          .hero-meta {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .panel-title-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  )
}
