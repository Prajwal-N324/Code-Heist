import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const EMPTY_FORM = {
  id: null,
  set_id: '',
  round_number: '',
  mission_title: '',
  mission_description: '',
  code_snippet: '',
  correct_answer_logic: ''
}

export default function AdminEditor() {
  const [session, setSession] = useState(null)
  const [rounds, setRounds] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState('')
  const [selectedRound, setSelectedRound] = useState(null)
  const [aiStrictness, setAiStrictness] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')

  useEffect(() => {
    async function initialize() {
      const { data } = await supabase.auth.getSession()
      setSession(data?.session || null)
    }

    initialize()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
    })

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchRounds()
      fetchAiStrictness()
    }
  }, [session])

  async function fetchRounds() {
    const { data, error } = await supabase
      .from('rounds')
      .select('id,set_id,round_number,mission_title,mission_description,code_snippet,correct_answer_logic')
      .order('set_id', { ascending: true })
      .order('round_number', { ascending: true })

    if (error) {
      setStatus('Unable to load rounds. Check permissions.')
      return
    }

    setRounds(data || [])
  }

  async function fetchAiStrictness() {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'ai_strictness')
      .single()

    if (!error && data?.value !== undefined) {
      setAiStrictness(Boolean(data.value))
    }
  }

  async function handleSignIn(event) {
    event.preventDefault()
    setStatus('Signing in...')

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword
    })

    if (error) {
      setStatus(error.message)
      return
    }

    setStatus('Signed in successfully. Loading command center...')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setSession(null)
    setRounds([])
    setSelectedRound(null)
    setForm(EMPTY_FORM)
    setAiStrictness(false)
    setStatus('Signed out. Refresh to log in again.')
  }

  function openRound(round) {
    setSelectedRound(round)
    setForm({
      id: round.id,
      set_id: round.set_id,
      round_number: round.round_number,
      mission_title: round.mission_title || '',
      mission_description: round.mission_description || '',
      code_snippet: round.code_snippet || '',
      correct_answer_logic: round.correct_answer_logic || ''
    })
    setStatus(`Edit mode open for round ${round.round_number}`)
  }

  async function toggleStrictness() {
    const nextValue = !aiStrictness
    const { error } = await supabase.from('settings').upsert(
      { key: 'ai_strictness', value: nextValue },
      { onConflict: 'key' }
    )

    if (error) {
      setStatus('Unable to update AI strictness. ' + error.message)
      return
    }

    setAiStrictness(nextValue)
    setStatus(`AI Strictness ${nextValue ? 'enabled' : 'disabled'}.`)
  }

  async function deployChanges(event) {
    event.preventDefault()
    if (!form.id) {
      setStatus('Select a round before deploying changes.')
      return
    }

    setStatus('Deploying changes...')
    const payload = {
      mission_title: form.mission_title,
      mission_description: form.mission_description,
      code_snippet: form.code_snippet,
      correct_answer_logic: form.correct_answer_logic
    }

    const { error } = await supabase.from('rounds').update(payload).eq('id', form.id)
    if (error) {
      setStatus('Deploy failed: ' + error.message)
      return
    }

    setStatus('Mission changes deployed successfully.')
    fetchRounds()
  }

  if (!session) {
    return (
      <main className="page-shell">
        <section className="terminal-panel">
          <h1>Command Center</h1>
          <p>This page is protected by Supabase Auth. Log in with your admin credentials.</p>
          <form onSubmit={handleSignIn} className="auth-panel">
            <label htmlFor="email">Admin Email</label>
            <input
              id="email"
              className="input"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              placeholder="admin@example.com"
              type="email"
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              placeholder="••••••••"
              type="password"
            />
            <button type="submit" className="btn-primary">Sign In</button>
          </form>
          {status && <div className="error-banner">{status}</div>}
        </section>
      </main>
    )
  }

  return (
    <main className="page-shell">
      <section className="terminal-panel command-center">
        <div className="command-header">
          <div>
            <span className="classified-badge">COMMAND CENTER</span>
            <h1>Mission Control</h1>
            <p className="hero-copy">Pick one of the four mission rounds, open Edit Mode, and deploy updated puzzle logic directly into the AI judge.</p>
          </div>
          <button type="button" className="btn-primary" onClick={handleSignOut}>SIGN OUT</button>
        </div>

        <div className="command-center-grid">
          <aside className="round-list-panel">
            <div className="info-card">
              <h2 className="section-title">Rounds</h2>
              <div className="round-list">
                {rounds.slice(0, 4).map((round) => (
                  <button
                    key={round.id}
                    type="button"
                    className={`round-card ${form.id === round.id ? 'active' : ''}`}
                    onClick={() => openRound(round)}
                  >
                    <div className="round-card-title">Set {round.set_id} · Round {round.round_number}</div>
                    <p>{round.mission_title || 'Untitled mission'}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="info-card settings-card">
              <h3 className="section-title">AI Strictness</h3>
              <p className="info-copy">When enabled, the judge evaluates answers with extra syntax and reasoning rigor.</p>
              <label className="switch">
                <input type="checkbox" checked={aiStrictness} onChange={toggleStrictness} />
                <span className="switch-slider"></span>
                <span className="switch-label">{aiStrictness ? 'ENABLED' : 'disabled'}</span>
              </label>
            </div>
          </aside>

          <article className="edit-panel">
            <div className="card">
              <div className="editor-header">
                <div>
                  <div className="tb-level">{form.id ? `Editing Round ${form.round_number}` : 'Edit Mode'}</div>
                  <h2 className="lv-title">{form.mission_title || 'Select a round to begin'}</h2>
                </div>
              </div>

              <form onSubmit={deployChanges} className="editor-wrap">
                <div className="field-group">
                  <label>Mission Title</label>
                  <input
                    className="input"
                    value={form.mission_title}
                    onChange={(event) => setForm((prev) => ({ ...prev, mission_title: event.target.value }))}
                    placeholder="e.g. Breach the archive"
                  />
                </div>
                <div className="field-group">
                  <label>Mission Description</label>
                  <textarea
                    className="input"
                    value={form.mission_description}
                    onChange={(event) => setForm((prev) => ({ ...prev, mission_description: event.target.value }))}
                    rows={4}
                    placeholder="Describe the mission objective in heist terms."
                  />
                </div>
                <div className="field-group">
                  <label>Code Snippet</label>
                  <textarea
                    className="input"
                    value={form.code_snippet}
                    onChange={(event) => setForm((prev) => ({ ...prev, code_snippet: event.target.value }))}
                    rows={6}
                    placeholder="Paste the reference code sample here."
                  />
                </div>
                <div className="field-group">
                  <label>Correct Answer Logic</label>
                  <textarea
                    className="input"
                    value={form.correct_answer_logic}
                    onChange={(event) => setForm((prev) => ({ ...prev, correct_answer_logic: event.target.value }))}
                    rows={4}
                    placeholder="Enter the exact expected logic for the AI judge."
                  />
                </div>
                <button type="submit" className="btn-primary">DEPLOY CHANGES</button>
                {status && (
                  <div className={status.toLowerCase().includes('failed') ? 'error-banner' : 'success-banner'}>{status}</div>
                )}
              </form>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
