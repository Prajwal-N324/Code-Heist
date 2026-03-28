import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const initialForm = {
  id: null,
  set_id: '',
  round_number: '',
  mission_text: '',
  code_snippet: '',
  correct_answer: ''
}

export default function AdminPuzzles() {
  const [session, setSession] = useState(null)
  const [rounds, setRounds] = useState([])
  const [selectedRound, setSelectedRound] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('')
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
    }
  }, [session])

  async function fetchRounds() {
    const { data, error } = await supabase
      .from('rounds')
      .select('id,set_id,round_number,prompt,mission_text,code_snippet,correct_answer')
      .order('set_id', { ascending: true })
      .order('round_number', { ascending: true })

    if (error) {
      setStatus('Unable to load rounds. Check permissions.')
      return
    }

    setRounds(data || [])
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

    setStatus('Signed in. Fetching rounds...')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setSession(null)
    setRounds([])
    setSelectedRound(null)
    setForm(initialForm)
    setStatus('Signed out. Refresh to log in again.')
  }

  function openModal(round) {
    setSelectedRound(round)
    setForm({
      id: round.id,
      set_id: round.set_id,
      round_number: round.round_number,
      mission_text: round.mission_text || round.prompt || '',
      code_snippet: round.code_snippet || '',
      correct_answer: round.correct_answer || ''
    })
    setStatus(`Editing round ${round.round_number} from set ${round.set_id}`)
  }

  function closeModal() {
    setSelectedRound(null)
    setForm(initialForm)
    setStatus('Edit cancelled.')
  }

  async function handleSave(event) {
    event.preventDefault()
    if (!form.id) {
      setStatus('Select a puzzle from the table before saving.')
      return
    }
    setStatus('Saving puzzle update...')

    const payload = {
      mission_text: form.mission_text,
      code_snippet: form.code_snippet,
      correct_answer: form.correct_answer
    }

    const { error } = await supabase.from('rounds').update(payload).eq('id', form.id)
    if (error) {
      setStatus('Update failed: ' + error.message)
      return
    }

    setStatus('Puzzle updated. AI judge will now use the new expected answer.')
    fetchRounds()
    closeModal()
  }

  if (!session) {
    return (
      <main className="page-shell">
        <section className="terminal-panel">
          <h1>Admin Puzzle Manager</h1>
          <p>Enter your Supabase admin credentials to access the high-level command center.</p>
          <form onSubmit={handleSignIn} className="auth-panel">
            <label htmlFor="email">Admin Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              placeholder="admin@example.com"
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              placeholder="••••••••"
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
      <section className="terminal-panel admin-panel">
        <div className="admin-topbar">
          <div>
            <span className="classified-badge">COMMAND CENTER</span>
            <h1>Puzzle Table</h1>
            <p className="hero-copy">Click a round row to open the mission modal, edit the mission narrative, code snippet, and expected answer, then save to push the update straight into the AI judge.</p>
          </div>
          <div>
            <div className="tb-logo">HEIST OPS</div>
            <div className="tb-mission">Secure editing access</div>
            <button type="button" className="btn-primary" onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>

        <div className="card info-card" style={{ marginTop: '24px' }}>
          <div className="editor-header">
            <div>
              <div className="tb-level">Rounds synced from Supabase</div>
              <h2 className="lv-title">Active Mission Grid</h2>
            </div>
            <div className="tb-mission">AI sync ready</div>
          </div>
          <div className="editor-wrap">
            <p className="info-copy">Use this secure view to manage each round’s mission text, code reference snippet, and expected answer. Save changes and the judge engine will use the new values instantly.</p>
            <div className="info-copy"><strong>Status:</strong> {status || 'Ready'}</div>
          </div>
        </div>

        <div className="table-wrap" style={{ marginTop: '24px' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Set</th>
                <th>Round</th>
                <th>Mission text</th>
                <th>Code snippet</th>
                <th>Expected answer</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((round) => (
                <tr key={round.id} onClick={() => openModal(round)}>
                  <td>{round.set_id || 'N/A'}</td>
                  <td>{round.round_number}</td>
                  <td>{round.mission_text || round.prompt || '—'}</td>
                  <td>{round.code_snippet ? `${round.code_snippet.slice(0, 80)}${round.code_snippet.length > 80 ? '…' : ''}` : '—'}</td>
                  <td>{round.correct_answer ? `${round.correct_answer.slice(0, 80)}${round.correct_answer.length > 80 ? '…' : ''}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedRound && (
        <div className="admin-modal" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <div>
                <div className="tb-level">Edit Round {selectedRound.round_number}</div>
                <h2 className="lv-title">Set {selectedRound.set_id} · Round {selectedRound.round_number}</h2>
              </div>
              <button type="button" className="btn-primary" onClick={closeModal}>Close</button>
            </div>
            <form className="admin-modal-body" onSubmit={handleSave}>
              <label>
                Mission text
                <textarea
                  className="input"
                  value={form.mission_text}
                  onChange={(event) => setForm((prev) => ({ ...prev, mission_text: event.target.value }))}
                  rows={4}
                />
              </label>
              <label>
                Code snippet
                <textarea
                  className="input"
                  value={form.code_snippet}
                  onChange={(event) => setForm((prev) => ({ ...prev, code_snippet: event.target.value }))}
                  rows={6}
                />
              </label>
              <label>
                Expected answer
                <textarea
                  className="input"
                  value={form.correct_answer}
                  onChange={(event) => setForm((prev) => ({ ...prev, correct_answer: event.target.value }))}
                  rows={3}
                />
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                <button type="submit" className="btn-primary">Save Puzzle</button>
                <button type="button" className="btn-hint-side" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
