import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function Leaderboard() {
  const router = useRouter()
  const [teams, setTeams] = useState([])
  const [error, setError] = useState('')
  const [authorized, setAuthorized] = useState(null)
  const [activeTab, setActiveTab] = useState('leaderboard')
  const [roundConfig, setRoundConfig] = useState([])
  const [setIds, setSetIds] = useState([])
  const [activeSetId, setActiveSetId] = useState('')
  const [selectedRound, setSelectedRound] = useState(null)
  const [roundForm, setRoundForm] = useState({
    id: null,
    set_id: '',
    round_number: '',
    mission_title: '',
    code_snippet: '',
    correct_answer: '',
    hint_text: '',
    location_reveal: ''
  })
  const [configStatus, setConfigStatus] = useState('')
  const [newTeamName, setNewTeamName] = useState('')
  const [generatedAccessCode, setGeneratedAccessCode] = useState('')
  const [registrationStatus, setRegistrationStatus] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    const authValue = typeof window !== 'undefined' ? window.localStorage.getItem('admin_auth') : null
    const isAuthorized = authValue === 'true'
    if (!isAuthorized) {
      router.replace('/')
      setAuthorized(false)
      return
    }
    setAuthorized(true)
  }, [router])

  useEffect(() => {
    if (authorized !== true) return

    let channel
    let mounted = true

    async function loadTeams() {
      const { data, error } = await supabase
        .from('teams')
        .select('id,code,name,score,question_set_id')
        .order('score', { ascending: false })

      if (error) {
        setError('Unable to fetch leaderboard.')
        return
      }

      if (mounted) setTeams(data || [])
    }

    async function loadConfig() {
      const [{ data: rounds, error: roundsError }, { data: activeSet, error: settingsError }] = await Promise.all([
        supabase
          .from('rounds')
          .select('id,set_id,round_number,mission_title,code_snippet,correct_answer,hint_text,campus_location,location_reveal')
          .order('set_id', { ascending: true })
          .order('round_number', { ascending: true }),
        supabase
          .from('settings')
          .select('value')
          .eq('key', 'active_set_id')
          .single()
      ])

      if (!roundsError && rounds) {
        setRoundConfig(rounds)
        setSetIds(Array.from(new Set(rounds.map((round) => round.set_id))))
      }
      if (!settingsError && activeSet?.value) {
        setActiveSetId(activeSet.value)
      }
    }

    loadTeams()
    loadConfig()

    channel = supabase
      .channel('leaderboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        (payload) => {
          const updatedTeam = payload.new
          if (!updatedTeam) {
            setTeams((prev) => prev.filter((team) => team.id !== payload.old?.id))
            return
          }

          setTeams((prev) => {
            const found = prev.find((team) => team.id === updatedTeam.id)
            if (found) {
              return prev
                .map((team) => (team.id === updatedTeam.id ? updatedTeam : team))
                .sort((a, b) => b.score - a.score)
            }
            return [...prev, updatedTeam].sort((a, b) => b.score - a.score)
          })
        }
      )
      .subscribe()

    return () => {
      mounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [authorized])

  const resetRoundForm = () => {
    setSelectedRound(null)
    setRoundForm({
      id: null,
      set_id: '',
      round_number: '',
      mission_title: '',
      code_snippet: '',
      correct_answer: '',
      hint_text: '',
      location_reveal: ''
    })
    setConfigStatus('Ready to create a new round.')
  }

  const generateAccessKey = (teamName) => {
    const cleaned = (teamName || 'HEIST')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)

    const first = (cleaned[0] || 'HEIS').slice(0, 4).padEnd(4, 'X')
    const second = (cleaned[1] || Math.floor(Date.now() / 1000).toString(36).toUpperCase().slice(-4)).slice(0, 4).padEnd(4, 'X')
    const salt = Array.from({ length: 4 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('')

    return `${first}-${second}-${salt}`
  }

  const handleCopyAccessCode = async () => {
    if (!generatedAccessCode) return
    try {
      await navigator.clipboard.writeText(generatedAccessCode)
      setRegistrationStatus('Access key copied to clipboard.')
    } catch {
      setRegistrationStatus('Copy failed. Please copy the key manually.')
    }
  }

  const handleGenerateAndRegister = async (event) => {
    event.preventDefault()
    const teamName = newTeamName.trim()
    if (!teamName) {
      setRegistrationStatus('Team Name is required.')
      return
    }

    setIsRegistering(true)
    setRegistrationStatus('Checking for duplicate teams...')

    const normalizeCheck = (result) => result.status === 'fulfilled' && result.value?.data && !result.value.error

    const duplicateChecks = await Promise.allSettled([
      supabase.from('teams').select('id').eq('name', teamName).maybeSingle(),
      supabase.from('teams').select('id').eq('team_name', teamName).maybeSingle()
    ])

    if (duplicateChecks.some(normalizeCheck)) {
      setRegistrationStatus('A team with that name already exists. Use a different name.')
      setIsRegistering(false)
      return
    }

    let accessCode = generateAccessKey(teamName)
    let collision = false
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const codeChecks = await Promise.allSettled([
        supabase.from('teams').select('id').eq('code', accessCode).maybeSingle(),
        supabase.from('teams').select('id').eq('access_code', accessCode).maybeSingle()
      ])
      if (!codeChecks.some(normalizeCheck)) {
        collision = false
        break
      }
      collision = true
      accessCode = generateAccessKey(teamName)
    }

    if (collision) {
      setRegistrationStatus('Unable to generate a unique access key. Try again.')
      setIsRegistering(false)
      return
    }

    const payload = {
      team_name: teamName,
      access_code: accessCode,
      name: teamName,
      code: accessCode,
      current_round: 1,
      letters_collected: '',
      score: 0
    }

    let insertResult = await supabase.from('teams').insert(payload)
    if (insertResult.error) {
      const fallbackPayload = {
        name: teamName,
        code: accessCode,
        current_round: 1,
        letters_collected: '',
        score: 0
      }
      const fallbackResult = await supabase.from('teams').insert(fallbackPayload)
      if (fallbackResult.error) {
        setRegistrationStatus('Registration failed: ' + fallbackResult.error.message)
        setIsRegistering(false)
        return
      }
    }

    setGeneratedAccessCode(accessCode)
    setRegistrationStatus('Team registered successfully. Access key ready.')
    setNewTeamName('')
    setIsRegistering(false)
  }

  const openRoundEditor = (round) => {
    setSelectedRound(round)
    setRoundForm({
      id: round.id,
      set_id: round.set_id || '',
      round_number: round.round_number || '',
      mission_title: round.mission_title || '',
      code_snippet: round.code_snippet || '',
      correct_answer: round.correct_answer || '',
      hint_text: round.hint_text || '',
      location_reveal: round.location_reveal || round.campus_location || ''
    })
    setConfigStatus(`Editing round ${round.round_number} from set ${round.set_id}`)
  }

  const handleActiveSetSave = async () => {
    if (!activeSetId) {
      setConfigStatus('Choose a valid set ID before saving.')
      return
    }

    const { error } = await supabase.from('settings').upsert({ key: 'active_set_id', value: activeSetId })
    if (error) {
      setConfigStatus('Unable to save active set: ' + error.message)
      return
    }

    setConfigStatus(`Active set updated to ${activeSetId}`)
  }

  const handleRoundSave = async (event) => {
    event.preventDefault()
    if (!roundForm.set_id || !roundForm.round_number) {
      setConfigStatus('Set ID and Round Number are required.')
      return
    }

    const payload = {
      set_id: roundForm.set_id,
      round_number: Number(roundForm.round_number),
      mission_title: roundForm.mission_title,
      code_snippet: roundForm.code_snippet,
      correct_answer: roundForm.correct_answer,
      hint_text: roundForm.hint_text,
      location_reveal: roundForm.location_reveal,
      campus_location: roundForm.location_reveal || roundForm.campus_location
    }

    if (roundForm.id) {
      const { error } = await supabase.from('rounds').update(payload).eq('id', roundForm.id)
      if (error) {
        setConfigStatus('Update failed: ' + error.message)
        return
      }
      setConfigStatus('Round updated successfully.')
    } else {
      const { error } = await supabase.from('rounds').insert(payload)
      if (error) {
        setConfigStatus('Create failed: ' + error.message)
        return
      }
      setConfigStatus('Round created successfully.')
    }

    const { data, error } = await supabase
      .from('rounds')
      .select('id,set_id,round_number,mission_title,code_snippet,correct_answer,hint_text,campus_location,location_reveal')
      .order('set_id', { ascending: true })
      .order('round_number', { ascending: true })

    if (!error && data) {
      setRoundConfig(data)
      setSetIds(Array.from(new Set(data.map((round) => round.set_id))))
    }
    resetRoundForm()
  }

  if (authorized !== true) {
    return null
  }

  return (
    <main className="page-shell leaderboard-shell">
      <div className="admin-tabs">
        <button
          className={activeTab === 'leaderboard' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
        <button
          className={activeTab === 'config' ? 'tab-button active' : 'tab-button'}
          onClick={() => setActiveTab('config')}
        >
          Event Configuration
        </button>
      </div>

      {activeTab === 'leaderboard' && (
        <section className="terminal-panel god-view">
          <div className="terminal-header">
          <div>
            <span className="terminal-tag">GOD VIEW</span>
            <h1>OVERWATCH COMMAND CENTER</h1>
          </div>
          <div className="status-pill">Super-Admin</div>
        </div>

        <p className="terminal-copy">
          Live scoreboard for organizers only. Team rankings stream in from Supabase in real time, powered by the teams feed.
        </p>

        {error && <div className="error-banner">{error}</div>}

        <div className="table-wrap neon-glow">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team Code</th>
                <th>Name</th>
                <th>Set</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr key={team.id || `${team.code}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{team.code}</td>
                  <td>{team.name || 'Unknown'}</td>
                  <td>{team.question_set_id || 'N/A'}</td>
                  <td>{team.score ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {activeTab === 'config' && (
        <section className="terminal-panel admin-panel">
          <div className="terminal-header">
            <div>
              <span className="terminal-tag">EVENT CONFIG</span>
              <h1>ROUND MANAGEMENT</h1>
            </div>
            <div className="status-pill">Active set: {activeSetId || 'unset'}</div>
          </div>

          <p className="terminal-copy">
            Add or edit rounds for each hackathon set. Choose the active set to control which rounds are live in the player.
          </p>

          <div className="config-row">
            <div className="config-card">
              <div className="editor-header">
                <div>
                  <div className="tb-level">Global Set Switcher</div>
                  <h2 className="lv-title">Active Set Selector</h2>
                </div>
              </div>

              <label className="config-label">
                Active set ID
                <select
                  className="input"
                  value={activeSetId}
                  onChange={(event) => setActiveSetId(event.target.value)}
                >
                  <option value="">Select set</option>
                  {setIds.map((setId) => (
                    <option key={setId} value={setId}>
                      {setId}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="btn-primary" onClick={handleActiveSetSave}>
                Save Active Set
              </button>
            </div>

            <div className="config-card">
              <div className="editor-header">
                <div>
                  <div className="tb-level">Round Editor</div>
                  <h2 className="lv-title">Add / Edit Round</h2>
                </div>
              </div>
              <form onSubmit={handleRoundSave} className="editor-wrap">
                <label>
                  Set ID
                  <input
                    className="input"
                    value={roundForm.set_id}
                    onChange={(event) => setRoundForm((prev) => ({ ...prev, set_id: event.target.value }))}
                    placeholder="e.g. alpha"
                  />
                </label>
                <label>
                  Round Number
                  <input
                    className="input"
                    type="number"
                    value={roundForm.round_number}
                    onChange={(event) => setRoundForm((prev) => ({ ...prev, round_number: event.target.value }))}
                    placeholder="1"
                  />
                </label>
                <label>
                  Title
                  <input
                    className="input"
                    value={roundForm.mission_title}
                    onChange={(event) => setRoundForm((prev) => ({ ...prev, mission_title: event.target.value }))}
                    placeholder="Abstraction"
                  />
                </label>
                <label>
                  Code Snippet
                  <textarea
                    className="input"
                    rows={4}
                    value={roundForm.code_snippet}
                    onChange={(event) => setRoundForm((prev) => ({ ...prev, code_snippet: event.target.value }))}
                  />
                </label>
                <label>
                  Correct Answer
                  <input
                    className="input"
                    value={roundForm.correct_answer}
                    onChange={(event) => setRoundForm((prev) => ({ ...prev, correct_answer: event.target.value }))}
                    placeholder="Expected answer"
                  />
                </label>
                <label>
                  Hint Text
                  <input
                    className="input"
                    value={roundForm.hint_text}
                    onChange={(event) => setRoundForm((prev) => ({ ...prev, hint_text: event.target.value }))}
                    placeholder="Enter the physical hint letter or clue"
                  />
                </label>
                <label>
                  Campus Location Reveal
                  <input
                    className="input"
                    value={roundForm.location_reveal}
                    onChange={(event) => setRoundForm((prev) => ({ ...prev, location_reveal: event.target.value }))}
                    placeholder="North Wing — Locker 5"
                  />
                </label>
                <div className="editor-btn-row">
                  <button type="submit" className="btn-primary">
                    {roundForm.id ? 'Save Round' : 'Create Round'}
                  </button>
                  <button type="button" className="btn-hint-side" onClick={resetRoundForm}>
                    Clear
                  </button>
                </div>
                {configStatus && <div className="info-banner">{configStatus}</div>}
              </form>
            </div>
          </div>

          <div className="config-row">
            <div className="config-card">
              <div className="editor-header">
                <div>
                  <div className="tb-level">Registration</div>
                  <h2 className="lv-title">Register New Team</h2>
                </div>
              </div>
              <form onSubmit={handleGenerateAndRegister} className="editor-wrap">
                <label>
                  Team Name
                  <input
                    className="input"
                    value={newTeamName}
                    onChange={(event) => setNewTeamName(event.target.value)}
                    placeholder="Enter the team name"
                  />
                </label>
                <button type="submit" className="btn-primary" disabled={isRegistering || !newTeamName.trim()}>
                  {isRegistering ? 'Generating...' : 'Generate & Register'}
                </button>

                {generatedAccessCode && (
                  <div className="access-box">
                    <div className="access-label">Generated Access Key</div>
                    <div className="access-key">{generatedAccessCode}</div>
                    <button type="button" className="btn-secondary" onClick={handleCopyAccessCode}>
                      Copy to Clipboard
                    </button>
                  </div>
                )}

                {registrationStatus && <div className="info-banner">{registrationStatus}</div>}
              </form>
            </div>
          </div>

          <div className="table-wrap neon-glow" style={{ marginTop: '24px' }}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Set</th>
                  <th>Round</th>
                  <th>Title</th>
                  <th>Code snippet</th>
                  <th>Answer</th>
                  <th>Hint Text</th>
                  <th>Location Reveal</th>
                </tr>
              </thead>
              <tbody>
                {roundConfig.map((round) => (
                  <tr key={round.id} onClick={() => openRoundEditor(round)}>
                    <td>{round.set_id || 'N/A'}</td>
                    <td>{round.round_number}</td>
                    <td>{round.mission_title || '—'}</td>
                    <td>{round.code_snippet ? `${round.code_snippet.slice(0, 80)}${round.code_snippet.length > 80 ? '…' : ''}` : '—'}</td>
                    <td>{round.correct_answer ? `${round.correct_answer.slice(0, 80)}${round.correct_answer.length > 80 ? '…' : ''}` : '—'}</td>
                    <td>{round.hint_text ? `${round.hint_text.slice(0, 80)}${round.hint_text.length > 80 ? '…' : ''}` : '—'}</td>
                    <td>{round.location_reveal || round.campus_location || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <style jsx global>{`
        .leaderboard-shell {
          padding: 32px 24px;
          min-height: 100vh;
          background: radial-gradient(circle at top left, rgba(255, 82, 82, 0.08), transparent 32%),
            radial-gradient(circle at bottom right, rgba(0, 230, 118, 0.08), transparent 28%),
            #04070a;
        }

        .admin-tabs {
          display: flex;
          gap: 14px;
          justify-content: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .tab-button {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: #d9e3ea;
          padding: 12px 24px;
          border-radius: 999px;
          cursor: pointer;
          transition: background .2s, border-color .2s, color .2s;
          font-family: var(--mono);
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .tab-button.active,
        .tab-button:hover {
          background: rgba(0, 230, 118, 0.16);
          border-color: rgba(0, 230, 118, 0.35);
          color: #ffffff;
        }

        .config-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 24px;
        }

        .config-card {
          background: rgba(2, 7, 13, 0.96);
          border: 1px solid rgba(0, 230, 118, 0.16);
          border-radius: 24px;
          padding: 24px;
          box-shadow: inset 0 0 30px rgba(0, 230, 118, 0.04);
        }

        .config-label {
          display: block;
          margin-bottom: 16px;
          color: #9bb3c1;
          font-size: 0.95rem;
        }

        .editor-btn-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .info-banner {
          margin-top: 18px;
          padding: 14px 16px;
          background: rgba(0, 230, 118, 0.08);
          border: 1px solid rgba(0, 230, 118, 0.16);
          border-radius: 16px;
          color: #c8f6d6;
        }

        .access-box {
          margin-top: 18px;
          padding: 18px;
          background: rgba(0, 230, 118, 0.06);
          border: 1px solid rgba(0, 230, 118, 0.18);
          border-radius: 20px;
        }

        .access-label {
          font-size: 0.75rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #9bb3c1;
          margin-bottom: 10px;
          display: block;
        }

        .access-key {
          font-family: var(--mono);
          font-size: 1rem;
          letter-spacing: 0.16em;
          padding: 14px 16px;
          background: rgba(0, 0, 0, 0.16);
          border-radius: 16px;
          color: #ffffff;
          margin-bottom: 12px;
          word-break: break-all;
        }

        .terminal-panel {
          background: rgba(4, 6, 10, 0.96);
          border: 1px solid rgba(255, 82, 82, 0.35);
          border-radius: 28px;
          box-shadow: 0 0 120px rgba(255, 82, 82, 0.12), 0 0 48px rgba(0, 230, 118, 0.12);
          color: #d9e3ea;
          padding: 32px;
          max-width: 1180px;
          margin: 0 auto;
          backdrop-filter: blur(14px);
        }

        .terminal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }

        .terminal-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255, 82, 82, 0.15);
          color: #ff9f9f;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .terminal-header h1 {
          font-family: var(--head);
          font-size: clamp(28px, 4vw, 42px);
          margin: 0;
          color: #ffffff;
          letter-spacing: 2px;
          text-shadow: 0 0 28px rgba(255, 82, 82, 0.28);
        }

        .status-pill {
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 2px;
          padding: 12px 18px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(255, 82, 82, 0.2), rgba(179, 136, 255, 0.18));
          color: #ffffff;
          border: 1px solid rgba(255, 82, 82, 0.35);
        }

        .terminal-copy {
          font-family: var(--ui);
          color: #9bb3c1;
          max-width: 860px;
          line-height: 1.9;
          margin-bottom: 24px;
        }

        .error-banner {
          margin-bottom: 20px;
          padding: 16px 18px;
          border: 1px solid rgba(255, 82, 82, 0.5);
          background: rgba(255, 82, 82, 0.08);
          color: #ffb3b3;
          border-radius: 16px;
        }

        .table-wrap {
          overflow-x: auto;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          background: rgba(2, 7, 13, 0.96);
          box-shadow: inset 0 0 50px rgba(0, 230, 118, 0.06);
        }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 720px;
        }

        .leaderboard-table th,
        .leaderboard-table td {
          padding: 18px 20px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-family: var(--ui);
          font-size: 14px;
          color: #d8e4ef;
        }

        .leaderboard-table th {
          color: #b6d7ff;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          background: rgba(255, 82, 82, 0.08);
        }

        .leaderboard-table tr:nth-child(odd) {
          background: rgba(255, 255, 255, 0.02);
        }

        .leaderboard-table tr:hover {
          background: rgba(255, 82, 82, 0.12);
        }

        .leaderboard-table td:first-child {
          color: #00e676;
          font-weight: 700;
        }

        .leaderboard-table td:nth-child(2) {
          color: #ff7b7b;
          letter-spacing: 0.5px;
        }

        .leaderboard-table td:nth-child(5) {
          font-family: var(--head);
          color: #b388ff;
        }

        @media (max-width: 880px) {
          .leaderboard-table th,
          .leaderboard-table td {
            padding: 14px 12px;
          }
        }
      `}</style>
    </main>
  )
}
