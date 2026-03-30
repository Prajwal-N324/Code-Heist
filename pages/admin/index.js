import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

function RoundManagementForm({ round, formState, setFormState }) {
  if (!round) {
    return <div className="editor-empty">Select a round to open the mission editor.</div>
  }

  return (
    <div className="round-form">
      <div className="preview-badge">SET {round.set_id} · ROUND {round.round_number}</div>
      <h3>{round.mission_title || 'Untitled mission'}</h3>
      <div className="field-row">
        <label>Mission title</label>
        <input
          value={formState.mission_title}
          onChange={(event) => setFormState({ ...formState, mission_title: event.target.value })}
          placeholder="Enter mission title"
        />
      </div>
      <div className="field-row">
        <label>Code snippet</label>
        <textarea
          value={formState.code_snippet}
          onChange={(event) => setFormState({ ...formState, code_snippet: event.target.value })}
          rows="4"
          placeholder="Add a new puzzle snippet"
        />
      </div>
      <div className="field-row two-column">
        <div>
          <label>Correct answer</label>
          <input
            value={formState.correct_answer}
            onChange={(event) => setFormState({ ...formState, correct_answer: event.target.value })}
            placeholder="Exact answer"
          />
        </div>
        <div>
          <label>Hint text</label>
          <input
            value={formState.hint_text}
            onChange={(event) => setFormState({ ...formState, hint_text: event.target.value })}
            placeholder="Subtle clue"
          />
        </div>
      </div>
      <div className="field-row">
        <label>Location reveal</label>
        <input
          value={formState.location_reveal}
          onChange={(event) => setFormState({ ...formState, location_reveal: event.target.value })}
          placeholder="Next location reveal"
        />
      </div>
      <div className="form-actions">
        <button
          type="button"
          className="save-btn"
          onClick={() => window.alert('Round editor is active. Save integration can be added here.')}
        >
          SAVE MISSION
        </button>
        <button
          type="button"
          className="reset-btn"
          onClick={() => setFormState({
            ...formState,
            mission_title: round.mission_title || '',
            code_snippet: round.code_snippet || '',
            correct_answer: round.correct_answer || '',
            hint_text: round.hint_text || '',
            location_reveal: round.location_reveal || ''
          })}
        >
          RESET DRAFT
        </button>
      </div>
    </div>
  )
}

function PuzzleEditorDrawer({ open, rounds, selectedRound, onSelect, loading, onClose, formState, setFormState }) {
  if (!open) return null

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="editor-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <p className="drawer-eyebrow">Puzzle Editor</p>
            <h2>Round management</h2>
          </div>
          <button className="drawer-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="drawer-body">
          <div className="editor-summary">
            <p>
              Modular round configuration that only appears when the puzzle editor is active.
            </p>
            <span>{loading ? 'Syncing round catalog…' : `${rounds.length} rounds available`}</span>
          </div>

          <div className="editor-grid">
            <div className="editor-list">
              {rounds.length > 0 ? (
                rounds.map((round) => (
                  <button
                    key={round.id}
                    type="button"
                    className={`editor-item ${selectedRound?.id === round.id ? 'active' : ''}`}
                    onClick={() => onSelect(round)}
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
                <RoundManagementForm round={selectedRound} formState={formState} setFormState={setFormState} />
              ) : (
                <div className="editor-empty">Select a round to inspect the mission payload.</div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default function AdminHub() {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [confirmResetOpen, setConfirmResetOpen] = useState(false)
  const [activityFeed, setActivityFeed] = useState([])
  const [leaderboardPreview, setLeaderboardPreview] = useState([])
  const [editorRounds, setEditorRounds] = useState([])
  const [selectedRound, setSelectedRound] = useState(null)
  const [formState, setFormState] = useState({
    mission_title: '',
    code_snippet: '',
    correct_answer: '',
    hint_text: '',
    location_reveal: ''
  })
  const [statusMessage, setStatusMessage] = useState('')
  const [toast, setToast] = useState('')
  const [loadingActivity, setLoadingActivity] = useState(false)
  const [loadingEditor, setLoadingEditor] = useState(false)
  const [clearPending, setClearPending] = useState(false)
  const [secureAccess, setSecureAccess] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const authorized = window.localStorage.getItem('admin_auth') === 'true'
    setSecureAccess(authorized)
    if (!authorized) {
      router.replace('/admin/register')
    }
  }, [router])

  useEffect(() => {
    if (!secureAccess) return
    fetchLiveActivity()
    fetchLeaderboardPreview()
  }, [secureAccess])

  useEffect(() => {
    if (!drawerOpen || !secureAccess) return
    fetchEditorRounds()
  }, [drawerOpen, secureAccess])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3800)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!selectedRound) return
    setFormState({
      mission_title: selectedRound.mission_title || '',
      code_snippet: selectedRound.code_snippet || '',
      correct_answer: selectedRound.correct_answer || '',
      hint_text: selectedRound.hint_text || '',
      location_reveal: selectedRound.location_reveal || ''
    })
  }, [selectedRound])

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

  const fetchLeaderboardPreview = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('id,team_name,score,current_round')
      .order('score', { ascending: false })
      .limit(3)

    if (!error && data) {
      setLeaderboardPreview(data)
    } else {
      setLeaderboardPreview([])
    }
  }

  const fetchEditorRounds = async () => {
    setLoadingEditor(true)
    const { data, error } = await supabase
      .from('rounds')
      .select('id,set_id,round_number,mission_title,code_snippet,correct_answer,hint_text,location_reveal')
      .order('set_id', { ascending: true })
      .order('round_number', { ascending: true })
      .limit(16)

    if (!error && data) {
      setEditorRounds(data)
      if (!selectedRound && data.length) {
        setSelectedRound(data[0])
      }
    }
    setLoadingEditor(false)
  }

  const handleSelectRound = (round) => {
    setSelectedRound(round)
  }

  const handleClearLeaderboard = async () => {
    setClearPending(true)
    let wiped = false

    const { error } = await supabase.from('ch_leaderboard').delete().neq('id', '')
    if (!error) {
      wiped = true
      await supabase.from('teams').update({ score: 0, current_round: 1 }).neq('id', '')
      setToast('Live leaderboard wiped from the database.')
    } else {
      window.localStorage.removeItem('codeheist_leaderboard')
      window.localStorage.removeItem('admin_auth')
      window.localStorage.removeItem('codeheist_team_config')
      setToast('Database wipe failed. Local leaderboard and admin session cleared.')
    }

    setClearPending(false)
    setConfirmResetOpen(false)
    if (!wiped) setSecureAccess(false)
    fetchLiveActivity()
  }

  const topPeek = leaderboardPreview.length > 0
    ? leaderboardPreview
    : activityFeed.slice(0, 3).map((item, index) => ({
      id: item.id || index,
      team_name: item.title,
      score: item.detail,
      current_round: ''
    }))

  if (secureAccess === false) {
    return null
  }

  return (
    <>
      <Head>
        <title>MISSION CONTROL | CODE HEIST</title>
        <meta name="description" content="Admin mission control dashboard for Code Heist." />
      </Head>

      <main className="dashboard-shell">
        <div className="dashboard-grid-layer" />
        <div className="dashboard-particles" />

        <div className="dashboard-content">
          <section className="hero-panel">
            <div>
              <div className="mission-title">
                <span className="live-dot" /> MISSION CONTROL // ADMIN
              </div>
              <h1>Cyberpunk command center for festival operations.</h1>
              <p>
                Fast, responsive admin control with live ranking preview, round editor access, agent recruitment, and hard-reset security.
              </p>
            </div>

            <div className="hero-meta">
              <div>
                <span>LIVE STATUS</span>
                <strong>ACTIVE</strong>
              </div>
              <div>
                <span>OPERATIONS</span>
                <strong>MISSION CONTROL</strong>
              </div>
            </div>
          </section>

          <section className="actions-panel">
            <div className="panel-title-row">
              <span className="panel-eyebrow">Quick Actions</span>
              <span className="panel-note">Four command cards with neon gradients and cybernetic hover glow.</span>
            </div>

            <div className="actions-grid">
              <Link href="/admin/leaderboard" className="dashboard-card card-blue">
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

                <div className="leaderboard-peek">
                  {topPeek.length > 0 ? (
                    topPeek.map((team, index) => (
                      <span key={team.id || index} className="peek-line">
                        {index + 1}. {team.team_name || 'Unknown'} · {typeof team.score === 'number' ? `${team.score} pts` : team.score}
                      </span>
                    ))
                  ) : (
                    <span className="peek-line muted">No leaderboard data available</span>
                  )}
                </div>

                <span className="card-action">View rankings →</span>
              </Link>

              <button type="button" className="dashboard-card card-green" onClick={() => setDrawerOpen(true)}>
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

              <Link href="/admin/register" className="dashboard-card card-amber">
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

              <button type="button" className="dashboard-card card-gray" onClick={() => setConfirmResetOpen(true)} disabled={clearPending}>
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
                    <h3>Hard wipe</h3>
                  </div>
                </div>
                <span className="card-action">Secure wipe →</span>
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

        <PuzzleEditorDrawer
          open={drawerOpen}
          rounds={editorRounds}
          selectedRound={selectedRound}
          onSelect={handleSelectRound}
          loading={loadingEditor}
          onClose={() => setDrawerOpen(false)}
          formState={formState}
          setFormState={setFormState}
        />

        {confirmResetOpen ? (
          <div className="modal-bg" onClick={() => setConfirmResetOpen(false)}>
            <div className="modal" onClick={(event) => event.stopPropagation()}>
              <div className="modal-title">// HIGH-SECURITY WIPE</div>
              <div className="modal-sub">
                This will clear leaderboard entries and remove local admin session state. Confirm only when the operation is intentional.
              </div>
              <div className="modal-actions">
                <button className="modal-ok" type="button" onClick={handleClearLeaderboard}>
                  EXECUTE WIPE
                </button>
                <button className="modal-cancel" type="button" onClick={() => setConfirmResetOpen(false)}>
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {toast ? <div className="toast-banner">{toast}</div> : null}
      </main>

      <style jsx>{`
        :global(body) {
          margin: 0;
          min-height: 100vh;
          background: #05080a;
          color: #cfd8dc;
          font-family: 'Share Tech Mono', monospace;
          overflow-x: hidden;
        }

        :global(*), :global(*::before), :global(*::after) {
          box-sizing: border-box;
        }

        .dashboard-shell {
          position: relative;
          min-height: 100vh;
          padding: 24px 0 48px;
          background: radial-gradient(circle at top left, rgba(0, 230, 118, 0.06), transparent 22%),
            radial-gradient(circle at 80% 12%, rgba(64, 196, 255, 0.08), transparent 24%),
            linear-gradient(180deg, rgba(8, 13, 16, 0.94), #05080a 95%);
          overflow: hidden;
          font-family: var(--mono);
        }

        .dashboard-grid-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: transparent;
          transform-origin: center;
          transform: rotateX(65deg) translateY(-120px);
          opacity: 0.22;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .dashboard-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            radial-gradient(circle at 10% 15%, rgba(255, 133, 74, 0.10), transparent 18%),
            radial-gradient(circle at 85% 8%, rgba(64, 196, 255, 0.10), transparent 15%),
            radial-gradient(circle at 45% 88%, rgba(255, 77, 77, 0.08), transparent 14%);
        }

        .dashboard-content {
          position: relative;
          z-index: 1;
          max-width: 1320px;
          margin: 0 auto;
          display: grid;
          gap: 34px;
          padding: 0 28px 24px;
        }

        .hero-panel,
        .actions-panel,
        .activity-panel {
          position: relative;
          padding: 32px;
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(5, 8, 10, 0.92);
          backdrop-filter: blur(20px);
          box-shadow: 0 32px 90px rgba(0, 0, 0, 0.24);
        }

        .hero-panel {
          display: grid;
          gap: 24px;
        }

        .mission-title {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #ffffff;
          font-size: 0.78rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          font-family: 'Orbitron', monospace;
        }

        .live-dot {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: #ff5252;
          box-shadow: 0 0 0 rgba(255, 82, 82, 0.9);
          animation: pulse 1.8s infinite ease-in-out;
        }

        .hero-panel h1 {
          margin: 0;
          font-size: clamp(2.4rem, 3.2vw, 3.8rem);
          line-height: 1.02;
          letter-spacing: -0.04em;
          color: #f5f8fb;
          max-width: 800px;
        }

        .hero-panel p {
          margin: 0;
          color: rgba(207, 216, 220, 0.78);
          max-width: 740px;
          line-height: 1.9;
          font-size: 1rem;
        }

        .hero-meta {
          display: grid;
          grid-template-columns: repeat(2, minmax(220px, 1fr));
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
          color: rgba(207, 216, 220, 0.74);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 0.72rem;
          margin-bottom: 8px;
        }

        .hero-meta strong {
          display: block;
          color: #e8f9ff;
          font-size: 1.1rem;
        }

        .panel-title-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 22px;
        }

        .panel-eyebrow {
          color: #8af7ff;
          font-size: 0.8rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          font-family: 'Share Tech Mono', monospace;
        }

        .panel-note {
          color: rgba(207, 216, 220, 0.68);
          font-size: 0.96rem;
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
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background-size: 200% 200%;
          transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease;
        }

        .dashboard-card:hover,
        .dashboard-card:focus-visible {
          transform: translateY(-8px) scale(1.02);
          z-index: 2;
        }

        .dashboard-card:hover.card-blue,
        .dashboard-card:focus-visible.card-blue {
          box-shadow: 0 0 48px rgba(92, 116, 255, 0.36);
        }

        .dashboard-card:hover.card-green,
        .dashboard-card:focus-visible.card-green {
          box-shadow: 0 0 48px rgba(0, 224, 146, 0.38);
        }

        .dashboard-card:hover.card-amber,
        .dashboard-card:focus-visible.card-amber {
          box-shadow: 0 0 48px rgba(255, 170, 80, 0.3);
        }

        .dashboard-card:hover.card-gray,
        .dashboard-card:focus-visible.card-gray {
          box-shadow: 0 0 48px rgba(255, 68, 83, 0.26);
        }

        .dashboard-card::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.12;
          pointer-events: none;
          background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.18), transparent 36%);
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
          color: rgba(255, 255, 255, 0.72);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-size: 0.74rem;
          font-family: 'Share Tech Mono', monospace;
        }

        .dashboard-card h3 {
          margin: 10px 0 0;
          color: #ffffff;
          font-size: 1.28rem;
          line-height: 1.18;
        }

        .card-action {
          margin-top: 24px;
          display: inline-flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.88);
          font-family: 'Share Tech Mono', monospace;
          letter-spacing: 0.18em;
          font-size: 0.86rem;
        }

        .leaderboard-peek {
          margin-top: 22px;
          display: grid;
          gap: 8px;
          font-size: 0.9rem;
          color: rgba(223, 232, 240, 0.88);
          line-height: 1.6;
        }

        .peek-line {
          display: block;
        }

        .peek-line.muted {
          color: rgba(174, 186, 196, 0.74);
          font-style: italic;
        }

        .card-blue {
          background: linear-gradient(135deg, #182c6f 0%, #4c3a9a 100%);
        }

        .card-green {
          background: linear-gradient(135deg, #0ca676 0%, #00c6d7 100%);
        }

        .card-amber {
          background: linear-gradient(135deg, #ffad43 0%, #ff6e27 100%);
        }

        .card-gray {
          background: linear-gradient(135deg, #161b22 0%, #2c323e 100%);
        }

        .card-icon-blue {
          background: rgba(72, 138, 255, 0.18);
        }

        .card-icon-green {
          background: rgba(124, 255, 174, 0.18);
        }

        .card-icon-amber {
          background: rgba(255, 193, 105, 0.18);
        }

        .card-icon-gray {
          background: rgba(255, 85, 96, 0.1);
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
          padding: 20px 24px;
          border-radius: 24px;
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
          color: rgba(207, 216, 220, 0.76);
          font-size: 0.94rem;
          line-height: 1.75;
        }

        .activity-time {
          color: rgba(207, 216, 220, 0.66);
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.78rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .activity-empty,
        .editor-empty {
          color: rgba(207, 216, 220, 0.72);
          font-size: 0.96rem;
          padding: 26px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .status-message {
          margin-top: 18px;
          color: rgba(173, 211, 236, 0.88);
          font-size: 0.95rem;
        }

        .drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 30;
          background: rgba(4, 10, 18, 0.84);
          backdrop-filter: blur(10px);
          display: grid;
          place-items: end center;
          padding: 24px;
        }

        .editor-drawer {
          width: min(720px, 100%);
          max-height: 100vh;
          background: rgba(7, 14, 24, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          padding: 28px;
          display: grid;
          gap: 24px;
          overflow: hidden;
          box-shadow: 0 40px 120px rgba(0, 0, 0, 0.35);
          animation: slideIn 0.35s ease;
        }

        .drawer-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }

        .drawer-eyebrow {
          color: #7bf5ff;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          font-size: 0.75rem;
          margin-bottom: 10px;
          font-family: 'Share Tech Mono', monospace;
        }

        .drawer-header h2 {
          margin: 0;
          color: #f6fbff;
          font-size: 1.95rem;
        }

        .drawer-close {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          font-size: 1.8rem;
          line-height: 1;
          cursor: pointer;
        }

        .drawer-body {
          display: grid;
          gap: 22px;
        }

        .editor-summary {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 22px;
          border-radius: 24px;
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
          font-family: 'Share Tech Mono', monospace;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 0.78rem;
        }

        .editor-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 20px;
          min-height: 320px;
        }

        .editor-list {
          display: grid;
          gap: 12px;
          overflow-y: auto;
          max-height: 560px;
          padding-right: 4px;
        }

        .editor-item {
          width: 100%;
          text-align: left;
          padding: 18px 20px;
          border-radius: 22px;
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
          box-shadow: 0 16px 40px rgba(0, 180, 255, 0.13);
        }

        .editor-item span {
          color: rgba(156, 228, 255, 0.75);
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .editor-item strong {
          display: block;
          color: #ffffff;
          font-size: 1rem;
        }

        .editor-preview {
          padding: 22px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          min-height: 320px;
        }

        .preview-badge {
          display: inline-flex;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(72, 190, 255, 0.12);
          color: #8bf7ff;
          font-family: 'Share Tech Mono', monospace;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 0.75rem;
          margin-bottom: 18px;
        }

        .editor-preview h3 {
          margin: 0 0 16px;
          color: #f9fdff;
          font-size: 1.45rem;
          line-height: 1.2;
        }

        .editor-preview p {
          margin: 0;
          color: rgba(223, 232, 240, 0.82);
          line-height: 1.85;
          font-size: 0.98rem;
        }

        .round-form {
          display: grid;
          gap: 16px;
        }

        .field-row {
          display: grid;
          gap: 10px;
        }

        .two-column {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .field-row label {
          color: rgba(207, 216, 220, 0.82);
          font-size: 0.78rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-family: 'Share Tech Mono', monospace;
        }

        .field-row input,
        .field-row textarea {
          width: 100%;
          min-height: 44px;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(6, 11, 18, 0.98);
          color: #eef7ff;
          font-family: inherit;
          font-size: 0.95rem;
          resize: vertical;
        }

        .field-row textarea {
          min-height: 120px;
        }

        .field-row input:focus,
        .field-row textarea:focus {
          outline: none;
          border-color: rgba(64, 196, 255, 0.55);
          box-shadow: 0 0 0 3px rgba(64, 196, 255, 0.12);
        }

        .form-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 14px;
        }

        .save-btn,
        .reset-btn,
        .modal-ok,
        .modal-cancel {
          cursor: pointer;
          border-radius: 14px;
          border: none;
          padding: 12px 24px;
          font-family: 'Share Tech Mono', monospace;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-size: 0.78rem;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .save-btn {
          background: #00e676;
          color: #05080a;
        }

        .save-btn:hover {
          transform: translateY(-1px);
          opacity: 0.96;
        }

        .reset-btn {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .reset-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 82, 82, 0.7);
          color: #ff8b8b;
        }

        .modal-bg {
          position: fixed;
          inset: 0;
          z-index: 40;
          display: grid;
          place-items: center;
          background: rgba(2, 6, 12, 0.86);
          padding: 24px;
        }

        .modal {
          width: min(520px, 100%);
          background: rgba(7, 12, 21, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 32px 28px;
        }

        .modal-title {
          font-family: 'Orbitron', monospace;
          font-size: 1rem;
          color: #ffab40;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .modal-sub {
          color: rgba(207, 216, 220, 0.78);
          line-height: 1.8;
          font-size: 0.95rem;
        }

        .modal-actions {
          display: flex;
          gap: 14px;
          margin-top: 26px;
          flex-wrap: wrap;
        }

        .modal-ok {
          background: #00e676;
          color: #05080a;
        }

        .modal-cancel {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: rgba(255, 255, 255, 0.88);
        }

        .toast-banner {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 50;
          padding: 14px 22px;
          border-radius: 16px;
          background: rgba(0, 230, 118, 0.14);
          color: #d8ffee;
          font-family: 'Share Tech Mono', monospace;
          letter-spacing: 0.12em;
          box-shadow: 0 18px 40px rgba(0, 160, 120, 0.18);
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.76; }
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @media (max-width: 1120px) {
          .actions-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .editor-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 820px) {
          .dashboard-content {
            gap: 24px;
          }

          .hero-panel,
          .actions-panel,
          .activity-panel {
            padding: 24px;
          }

          .hero-meta {
            grid-template-columns: 1fr;
          }

          .panel-title-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .dashboard-content {
            padding: 0 20px 20px;
          }

          .hero-panel h1 {
            font-size: 2.2rem;
          }

          .dashboard-card {
            padding: 24px;
          }

          .editor-grid {
            padding: 0;
          }

          .field-row input,
          .field-row textarea {
            padding: 13px 14px;
          }
        }
      `}</style>
    </>
  )
}
