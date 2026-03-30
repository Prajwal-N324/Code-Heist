import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

const ADMIN_PASSWORD = "admin2025"

const LEVEL_META = [
  { name: "Abstraction", short: "L1", hasSynonyms: false },
  { name: "Encapsulation", short: "L2", hasSynonyms: false },
  { name: "Inheritance", short: "L3", hasSynonyms: false },
  { name: "Polymorphism", short: "L4", hasSynonyms: true },
]

const DEFAULT_LEVELS = [
  {
    answer: "HEIST RELAY: NORTH-WING-5",
    letter: "N",
    next_location: "North Wing — Locker 5",
    hint: "Trace the public → private method chain. What does broadcastLocation() actually print?",
    question: "",
    task: "ABSTRACTION — Private Vault. Four outputs are on your card. Trace the public → private call chain. Which one does broadcastLocation() actually print? Select below, then submit the EXACT string.",
  },
  {
    answer: "ENCAPSULATION OUTPUT",
    letter: "E",
    next_location: "West Corridor — Archive Room, Shelf 3",
    hint: "The constructor values don't matter — only the FINAL state after all setters run matters.",
    question: "",
    task: "ENCAPSULATION — Jumbled Code Box. The constructor sets values — but setters are called AFTER it. Trace every setter call in order and find the object's FINAL state. Submit the exact output of getExactClue()."
  },
  {
    answer: "SECTOR: 25_WN",
    letter: "X",
    next_location: "Sector 25 — West Node",
    hint: "Java calls the RUNTIME type's method, not the declared type. The child's @Override wins.",
    question: "",
    task: "INHERITANCE — Clue Chain. Your L1 & L2 outputs are already substituted. Trace through the CHILD's overridden locateNext(). The parent outputs ERROR — ignore it. Submit the exact printed output."
  },
  {
    answer: "CODE HEIST KEY: NEXU",
    letter: "U",
    next_location: null,
    hint: "Same method name does NOT mean same behavior. Match each synonym to its EXACT decoder class.",
    question: "",
    task: "POLYMORPHISM — Synonym Lock. Use the synonym sheet. Match each synonym to the correct decoder class. Same interface decode() — but each class only accepts ONE specific synonym. Wrong class = '?'. Submit the final printed output.",
    synonym_sheet: {
      north: ["compass", "septentrion", "boreal", "zenith"],
      west: ["occident", "dextral", "leftward", "hesperian"],
      num25: ["score+5", "five-squared", "xxv", "binary-11001"]
    },
    correct_synonyms: { north: "septentrion", west: "occident", num25: "xxv" }
  }
]

export default function AdminHub() {
  const router = useRouter()
  const [secureAccess, setSecureAccess] = useState(null)
  const [currentTeam, setCurrentTeam] = useState(null)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [teams, setTeams] = useState([])
  const [levelData, setLevelData] = useState({})
  const [leaderboardEntries, setLeaderboardEntries] = useState([])
  const [toast, setToast] = useState('')
  const [modalOpen, setModalOpen] = useState(null)
  const [newTeamId, setNewTeamId] = useState('')
  const [importJson, setImportJson] = useState('')
  const [loading, setLoading] = useState(true)

  // Check auth on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const authorized = window.localStorage.getItem('admin_auth') === 'true'
    setSecureAccess(authorized)
    if (!authorized) {
      router.replace('/admin/register')
    } else {
      loadTeams()
      subscribeToRealtimeUpdates()
    }
  }, [router])

  // Subscribe to real-time updates
  const subscribeToRealtimeUpdates = () => {
    const teams = supabase.channel('team_config_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_config' }, () => {
        loadTeams()
      })
      .subscribe()

    const levels = supabase.channel('level_data_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_level_data' }, () => {
        if (currentTeam) loadLevelData(currentTeam)
      })
      .subscribe()

    return () => {
      teams.unsubscribe()
      levels.unsubscribe()
    }
  }

  const loadTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('team_config')
        .select('*')
        .order('team_id', { ascending: true })

      if (error) throw error
      setTeams(data || [])
    } catch (e) {
      console.error('Error loading teams:', e)
      showToast('Error loading teams', true)
    }
  }

  const loadLevelData = async (teamId) => {
    try {
      const { data, error } = await supabase
        .from('team_level_data')
        .select('*')
        .eq('team_id', teamId)
        .order('level', { ascending: true })

      if (error) throw error

      const byLevel = {}
      if (data && data.length > 0) {
        data.forEach(item => {
          byLevel[item.level] = item
        })
      } else {
        // Create default levels if they don't exist
        for (let i = 0; i < 4; i++) {
          const { error: insertError } = await supabase
            .from('team_level_data')
            .insert({
              team_id: teamId,
              level: i + 1,
              ...DEFAULT_LEVELS[i]
            })
          if (insertError) console.error('Error creating default level:', insertError)
        }
        // Reload after creating defaults
        const { data: newData } = await supabase
          .from('team_level_data')
          .select('*')
          .eq('team_id', teamId)
          .order('level', { ascending: true })
        newData?.forEach(item => {
          byLevel[item.level] = item
        })
      }

      setLevelData(byLevel)
      setLoading(false)
    } catch (e) {
      console.error('Error loading level data:', e)
      showToast('Error loading level data', true)
      setLoading(false)
    }
  }

  const selectTeam = async (team) => {
    setCurrentTeam(team.team_id)
    setCurrentLevel(0)
    setLoading(true)
    await loadLevelData(team.team_id)
  }

  const switchLevel = async (n) => {
    await collectAndSave(currentLevel, false)
    setCurrentLevel(n)
  }

  const collectAndSave = async (levelIdx, showFeedback) => {
    if (!currentTeam) return

    const answerEl = document.getElementById('f-answer')
    const letterEl = document.getElementById('f-letter')
    const locationEl = document.getElementById('f-location')
    const hintEl = document.getElementById('f-hint')
    const questionEl = document.getElementById('f-question')
    const taskEl = document.getElementById('f-task')

    const updateData = {}
    if (answerEl) updateData.answer = answerEl.value.trim()
    if (letterEl) updateData.letter = letterEl.value.trim()
    if (locationEl) updateData.next_location = locationEl.value.trim() || null
    if (hintEl) updateData.hint = hintEl.value.trim()
    if (questionEl) updateData.question = questionEl.value
    if (taskEl) updateData.task = taskEl.value.trim()

    try {
      const { error } = await supabase
        .from('team_level_data')
        .update(updateData)
        .eq('team_id', currentTeam)
        .eq('level', levelIdx + 1)

      if (error) throw error
      if (showFeedback) {
        showToast(`✓ Level ${levelIdx + 1} saved for ${currentTeam}`)
      }
    } catch (e) {
      console.error('Error saving level:', e)
      showToast('Error saving level', true)
    }
  }

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError })
    setTimeout(() => setToast(''), 2800)
  }

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from('team_level_data')
        .select('*')

      if (error) throw error

      const config = {}
      data?.forEach(level => {
        if (!config[level.team_id]) config[level.team_id] = {}
        config[level.team_id][level.level - 1] = level
      })

      const json = JSON.stringify(config, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'codeheist_config.json'
      a.click()
      URL.revokeObjectURL(url)
      showToast('Config exported')
    } catch (e) {
      console.error('Export error:', e)
      showToast('Export failed', true)
    }
  }

  const handleImport = async () => {
    try {
      const imported = JSON.parse(importJson)
      let count = 0

      for (const [teamId, levels] of Object.entries(imported)) {
        // Ensure team exists
        const { error: teamError } = await supabase
          .from('team_config')
          .upsert({ team_id: teamId })

        if (teamError) throw teamError

        // Insert/update levels
        for (const [levelIdx, levelData] of Object.entries(levels)) {
          const level = parseInt(levelIdx) + 1
          const { error } = await supabase
            .from('team_level_data')
            .upsert({
              team_id: teamId,
              level,
              ...levelData
            })
          if (error) throw error
          count++
        }
      }

      loadTeams()
      setModalOpen(null)
      setImportJson('')
      showToast(`✓ Imported ${count} level configs`)
    } catch (e) {
      console.error('Import error:', e)
      showToast('Invalid JSON or import failed', true)
    }
  }

  const handleViewConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('team_level_data')
        .select('*')

      if (error) throw error

      const config = {}
      data?.forEach(level => {
        if (!config[level.team_id]) config[level.team_id] = {}
        config[level.team_id][level.level - 1] = level
      })

      const textarea = document.getElementById('config-viewer')
      if (textarea) textarea.value = JSON.stringify(config, null, 2)
      setModalOpen('config')
    } catch (e) {
      console.error('Error viewing config:', e)
      showToast('Error loading config', true)
    }
  }

  const handleResetAll = async () => {
    try {
      const { error } = await supabase
        .from('team_config')
        .delete()
        .neq('team_id', '')

      if (error) throw error

      setCurrentTeam(null)
      setCurrentLevel(0)
      setLevelData({})
      await loadTeams()
      setModalOpen(null)
      showToast('All team configs reset')
    } catch (e) {
      console.error('Reset error:', e)
      showToast('Reset failed', true)
    }
  }

  const handleNewTeam = async () => {
    const id = newTeamId.trim().toUpperCase()
    if (!id) return

    try {
      const { error: teamError } = await supabase
        .from('team_config')
        .insert({ team_id: id })

      if (teamError && teamError.code !== '23505') throw teamError

      // Insert default levels
      for (let i = 0; i < 4; i++) {
        const { error } = await supabase
          .from('team_level_data')
          .insert({
            team_id: id,
            level: i + 1,
            ...DEFAULT_LEVELS[i]
          })
        if (error && error.code !== '23505') throw error
      }

      await loadTeams()
      setModalOpen(null)
      setNewTeamId('')
      selectTeam({ team_id: id })
      showToast(`✓ Team ${id} created`)
    } catch (e) {
      console.error('New team error:', e)
      showToast('Failed to create team', true)
    }
  }

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('ch_leaderboard')
        .select('*')
        .order('completed_at', { ascending: true })

      if (error) throw error
      setLeaderboardEntries(data || [])
    } catch (e) {
      console.error('Error loading leaderboard:', e)
    }
  }

  useEffect(() => {
    if (secureAccess) {
      loadLeaderboard()
    }
  }, [secureAccess])

  const renderLeaderboard = () => {
    if (!leaderboardEntries.length) {
      return <div className="lb-empty">// No completions recorded yet — waiting for teams…</div>
    }

    const rankLabels = ['gold', 'silver', 'bronze']

    return (
      <table className="lb-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>Completed At</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardEntries.map((e, i) => {
            const rankClass = rankLabels[i] || ''
            const rankSym = ['🥇', '🥈', '🥉'][i] || (i + 1)
            const ts = new Date(e.completed_at)
            const timeStr = ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            const dateStr = ts.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
            let dur = ''
            if (e.started_at) {
              const secs = Math.floor((ts - new Date(e.started_at)) / 1000)
              const m = Math.floor(secs / 60), s = secs % 60
              dur = `${m}m ${s}s`
            }
            return (
              <tr key={e.id}>
                <td className={`lb-rank ${rankClass}`}>{rankSym}</td>
                <td><div className="lb-team">{e.team || '—'}</div></td>
                <td className="lb-time">{timeStr}</td>
                <td className="lb-duration">{dur || '—'}</td>
                <td><span className="lb-level done">ALL 4 DONE</span></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }

  if (secureAccess === false) return null

  const currentLevelData = levelData[currentLevel + 1]

  return (
    <>
      <Head>
        <title>CODE HEIST — ADMIN CONTROL</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="topbar">
        <div className="tb-logo">// ADMIN</div>
        <div className="tb-badge">CODE HEIST CONTROL PANEL</div>
        <div className="tb-spacer"></div>
        <button className="tb-logout" onClick={() => {
          localStorage.removeItem('admin_auth')
          router.push('/admin/register')
        }}>LOGOUT</button>
      </div>

      <div className="admin-body">
        {/* LEADERBOARD */}
        <div className="lb-section">
          <div className="section-head" style={{ marginBottom: '10px' }}>
            <div>
              <div className="section-title">// LEADERBOARD</div>
              <div className="section-sub">Teams ranked by completion time. Timestamps recorded when team completes all 4 levels.</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="lb-refresh" onClick={() => loadLeaderboard()}>↺ Refresh</button>
              <button className="lb-clear" onClick={() => {
                if (confirm('Clear all leaderboard entries?')) {
                  supabase.from('ch_leaderboard').delete().neq('id', '').then(() => loadLeaderboard())
                }
              }}>✕ Clear</button>
            </div>
          </div>
          <div id="leaderboard-container">
            {renderLeaderboard()}
          </div>
        </div>

        {/* TEAM SELECTOR */}
        <div className="section-head">
          <div>
            <div className="section-title">// SELECT TEAM</div>
            <div className="section-sub">Choose a team to configure their level questions, answers, hints & locations.</div>
          </div>
        </div>

        <div className="team-bar">
          {teams.map(t => (
            <div
              key={t.team_id}
              className={`team-pill ${currentTeam === t.team_id ? 'active' : ''}`}
              onClick={() => selectTeam(t)}
            >
              {t.team_id}
            </div>
          ))}
          <button className="new-team-btn" onClick={() => {
            setNewTeamId('')
            setModalOpen('newteam')
          }}>+ Add Team</button>
        </div>

        {/* LEVEL EDITOR */}
        {currentTeam && !loading ? (
          <div id="editor-area">
            <div className="section-head">
              <div>
                <div className="section-title" id="editor-title">// {currentTeam} · LEVEL CONFIG</div>
                <div className="section-sub">Each level can have a unique question, answer, hints and location reveal for this team.</div>
              </div>
            </div>

            {/* Level Tabs */}
            <div className="level-tabs">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`ltab ${currentLevel === i ? 'active' : ''}`}
                  onClick={() => switchLevel(i)}
                >
                  <span className="lnum">L{i + 1}</span>
                  {LEVEL_META[i].name}
                </div>
              ))}
            </div>

            {/* Level Form */}
            {currentLevelData && (
              <div className="level-form">
                <div className="form-grid">
                  <div className="field-group">
                    <label>CORRECT ANSWER <span>exact string player must submit</span></label>
                    <input
                      type="text"
                      id="f-answer"
                      defaultValue={currentLevelData.answer || ''}
                      placeholder="exact answer string"
                    />
                    <div className="field-hint">Case-sensitive. The AI guardian checks for this exact string to unlock the next level.</div>
                  </div>
                  <div className="field-group">
                    <label>SECRET LETTER <span>unlocked when this level is solved</span></label>
                    <input
                      type="text"
                      id="f-letter"
                      defaultValue={currentLevelData.letter || ''}
                      placeholder="single letter e.g. N"
                      maxLength="2"
                    />
                  </div>
                </div>
                <div className="form-grid" style={{ marginTop: '16px' }}>
                  <div className="field-group">
                    <label>NEXT LOCATION REVEAL <span>shown after correct answer</span></label>
                    <input
                      type="text"
                      id="f-location"
                      defaultValue={currentLevelData.next_location || ''}
                      placeholder="e.g. East Wing — Room 12"
                    />
                    <div className="field-hint">Leave blank for the final level.</div>
                  </div>
                  <div className="field-group">
                    <label>HINT TEXT <span>shown when player clicks HINT</span></label>
                    <input
                      type="text"
                      id="f-hint"
                      defaultValue={currentLevelData.hint || ''}
                      placeholder="indirect clue without giving away the answer"
                    />
                  </div>
                </div>
                <div className="form-grid full" style={{ marginTop: '16px' }}>
                  <div className="field-group">
                    <label>QUESTION / PUZZLE <span>the actual question shown to this team in the code panel</span></label>
                    <textarea
                      id="f-question"
                      defaultValue={currentLevelData.question || ''}
                      placeholder="Type the question, code snippet, or puzzle clue for this team…"
                      style={{ minHeight: '180px', fontFamily: 'monospace', fontSize: '12px' }}
                    ></textarea>
                    <div className="field-hint">✦ This is what the team sees in the code panel. Each team gets their own unique question per level. Plain text or code — anything goes.</div>
                  </div>
                </div>
                <div className="form-grid full" style={{ marginTop: '16px' }}>
                  <div className="field-group">
                    <label>TASK DESCRIPTION <span>instruction line shown below the question</span></label>
                    <textarea
                      id="f-task"
                      defaultValue={currentLevelData.task || ''}
                      placeholder="e.g. Trace the method chain and submit the exact output…"
                    ></textarea>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    className="save-btn"
                    onClick={() => collectAndSave(currentLevel, true)}
                  >
                    SAVE LEVEL {currentLevel + 1}
                  </button>
                  <button
                    className="reset-btn"
                    onClick={async () => {
                      if (confirm(`Reset Level ${currentLevel + 1} for ${currentTeam} to defaults?`)) {
                        await supabase
                          .from('team_level_data')
                          .update(DEFAULT_LEVELS[currentLevel])
                          .eq('team_id', currentTeam)
                          .eq('level', currentLevel + 1)
                        await loadLevelData(currentTeam)
                      }
                    }}
                  >
                    RESET TO DEFAULT
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">🔒</div>
            <div>{loading ? 'Loading...' : 'Select a team above to configure their levels.'}</div>
          </div>
        )}

        {/* TOOLS */}
        <div className="tools-bar">
          <button className="tool-btn" onClick={handleExport}>⬇ Export All Config (JSON)</button>
          <button className="tool-btn" onClick={() => {
            setImportJson('')
            setModalOpen('import')
          }}>⬆ Import Config (JSON)</button>
          <button className="tool-btn" onClick={handleViewConfig}>👁 View Raw Config</button>
          <button className="tool-btn danger" onClick={() => setModalOpen('confirm-reset')}>⚠ Reset All Teams</button>
        </div>
      </div>

      {/* MODALS */}
      {modalOpen === 'newteam' && (
        <div className="modal-bg" onClick={() => setModalOpen(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">// NEW TEAM</div>
            <div className="modal-sub">Enter a team ID (e.g. TEAM-07). This will create a new slot for configuration.</div>
            <div className="field-group">
              <label className="field-label">TEAM ID</label>
              <input
                className="field-input"
                type="text"
                value={newTeamId}
                onChange={e => setNewTeamId(e.target.value)}
                placeholder="e.g. TEAM-07"
                onKeyDown={e => e.key === 'Enter' && handleNewTeam()}
              />
            </div>
            <div className="modal-actions">
              <button className="modal-ok" onClick={handleNewTeam}>CREATE</button>
              <button className="modal-cancel" onClick={() => setModalOpen(null)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {modalOpen === 'import' && (
        <div className="modal-bg" onClick={() => setModalOpen(null)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">// IMPORT CONFIG</div>
            <div className="modal-sub">Paste a previously exported JSON config below. This will MERGE with existing config (not replace).</div>
            <div className="field-group">
              <textarea
                className="field-input"
                value={importJson}
                onChange={e => setImportJson(e.target.value)}
                placeholder='{ "TEAM-01": { ... }, "TEAM-02": { ... } }'
                style={{ minHeight: '180px', fontSize: '11px' }}
              ></textarea>
            </div>
            <div className="modal-actions">
              <button className="modal-ok" onClick={handleImport}>IMPORT</button>
              <button className="modal-cancel" onClick={() => setModalOpen(null)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {modalOpen === 'config' && (
        <div className="modal-bg" onClick={() => setModalOpen(null)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">// RAW CONFIG (Supabase)</div>
            <div className="modal-sub">Current stored configuration for all teams:</div>
            <textarea
              id="config-viewer"
              className="config-viewer"
              readOnly
              defaultValue=""
            ></textarea>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setModalOpen(null)}>CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {modalOpen === 'confirm-reset' && (
        <div className="modal-bg" onClick={() => setModalOpen(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">// CONFIRM RESET</div>
            <div className="modal-sub">This will delete ALL team configurations. The game will fall back to default questions for all teams. This cannot be undone.</div>
            <div className="modal-actions">
              <button className="modal-ok" style={{ background: 'var(--red)', color: 'var(--bg)' }} onClick={handleResetAll}>RESET ALL</button>
              <button className="modal-cancel" onClick={() => setModalOpen(null)}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast show${toast.isError ? ' err' : ''}`}>{toast.msg}</div>}

      <style jsx>{`
        :global(body) {
          margin: 0;
          padding: 0;
          background: #05080a;
          color: #cfd8dc;
          font-family: 'Share Tech Mono', monospace;
          overflow-x: hidden;
        }
        :global(*), :global(*::before), :global(*::after) {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        :global(html) {
          scroll-behavior: smooth;
        }
        :global(body::before) {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,.04) 3px, rgba(0,0,0,.04) 4px);
        }

        .topbar {
          background: #080d10;
          border-bottom: 1px solid #112233;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          height: 52px;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .tb-logo {
          font-family: 'Orbitron', monospace;
          font-size: 13px;
          color: #ff5252;
          letter-spacing: 3px;
        }
        .tb-badge {
          font-size: 9px;
          font-weight: 700;
          color: #78909c;
          letter-spacing: 2px;
        }
        .tb-spacer {
          flex: 1;
        }
        .tb-logout {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: #78909c;
          background: none;
          border: 1px solid #112233;
          padding: 5px 14px;
          cursor: pointer;
          border-radius: 2px;
          letter-spacing: 1px;
          transition: all .2s;
        }
        .tb-logout:hover {
          color: #ff5252;
          border-color: #ff5252;
        }

        .admin-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px 60px;
          position: relative;
          z-index: 1;
        }

        .section-head {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }
        .section-title {
          font-family: 'Orbitron', monospace;
          font-size: 13px;
          color: #ffab40;
          letter-spacing: 2px;
        }
        .section-sub {
          font-size: 10px;
          font-weight: 700;
          color: #78909c;
        }

        .team-bar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #112233;
        }
        .team-pill {
          padding: 6px 18px;
          background: #080d10;
          border: 1px solid #112233;
          color: #78909c;
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          cursor: pointer;
          border-radius: 2px;
          transition: all .15s;
        }
        .team-pill:hover {
          border-color: #1a3344;
          color: #cfd8dc;
        }
        .team-pill.active {
          background: rgba(0, 230, 118, .08);
          border-color: #00e676;
          color: #00e676;
        }
        .new-team-btn {
          padding: 6px 18px;
          background: none;
          border: 1px dashed #112233;
          color: #78909c;
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          cursor: pointer;
          border-radius: 2px;
          transition: all .15s;
        }
        .new-team-btn:hover {
          border-color: #ffab40;
          color: #ffab40;
        }

        .level-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
        }
        .ltab {
          padding: 8px 20px;
          background: #080d10;
          border: 1px solid #112233;
          color: #78909c;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          cursor: pointer;
          border-radius: 2px 2px 0 0;
          transition: all .15s;
        }
        .ltab:hover {
          color: #cfd8dc;
        }
        .ltab.active {
          background: #0c1318;
          border-bottom-color: #0c1318;
          color: #cfd8dc;
        }
        .ltab .lnum {
          color: #ffab40;
          font-weight: bold;
          margin-right: 6px;
        }

        .level-form {
          background: #0c1318;
          border: 1px solid #112233;
          border-top: none;
          border-radius: 0 2px 2px 2px;
          padding: 28px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .form-grid.full {
          grid-template-columns: 1fr;
        }
        .field-group {
          display: grid;
          gap: 6px;
          margin-bottom: 0;
        }
        .field-group label {
          font-size: 10px;
          color: #78909c;
          letter-spacing: 2px;
          display: block;
          font-weight: 700;
        }
        .field-group label span {
          color: #ffab40;
          margin-left: 6px;
          font-size: 9px;
        }
        .field-group input, .field-group textarea {
          width: 100%;
          background: #05080a;
          border: 1px solid #112233;
          color: #cfd8dc;
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          padding: 10px 12px;
          border-radius: 2px;
          outline: none;
          transition: border-color .2s;
          resize: vertical;
        }
        .field-group textarea {
          min-height: 120px;
          line-height: 1.6;
        }
        .field-group input:focus, .field-group textarea:focus {
          border-color: #40c4ff;
        }
        .field-hint {
          font-size: 10px;
          font-weight: 700;
          color: #78909c;
          margin-top: 5px;
          line-height: 1.5;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid #112233;
          align-items: center;
        }
        .save-btn {
          padding: 10px 32px;
          background: #00e676;
          color: #05080a;
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          border: none;
          cursor: pointer;
          border-radius: 2px;
          transition: opacity .2s;
        }
        .save-btn:hover {
          opacity: .85;
        }
        .reset-btn {
          padding: 10px 20px;
          background: none;
          border: 1px solid #112233;
          color: #78909c;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          cursor: pointer;
          border-radius: 2px;
          transition: all .15s;
        }
        .reset-btn:hover {
          border-color: #ff5252;
          color: #ff5252;
        }

        .tools-bar {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 36px;
          padding-top: 28px;
          border-top: 1px solid #112233;
        }
        .tool-btn {
          padding: 9px 22px;
          background: #080d10;
          border: 1px solid #112233;
          color: #78909c;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          cursor: pointer;
          border-radius: 2px;
          transition: all .15s;
        }
        .tool-btn:hover {
          border-color: #40c4ff;
          color: #40c4ff;
        }
        .tool-btn.danger:hover {
          border-color: #ff5252;
          color: #ff5252;
        }

        .modal-bg {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0, 0, 0, .7);
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .modal-bg {
          display: flex;
        }
        .modal {
          background: #080d10;
          border: 1px solid #1a3344;
          border-radius: 4px;
          padding: 32px 28px;
          width: 100%;
          max-width: 480px;
        }
        .modal-title {
          font-family: 'Orbitron', monospace;
          font-size: 14px;
          color: #ffab40;
          margin-bottom: 8px;
        }
        .modal-sub {
          font-size: 11px;
          color: #78909c;
          margin-bottom: 24px;
        }
        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 24px;
        }
        .modal-ok {
          padding: 9px 24px;
          background: #00e676;
          color: #05080a;
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          border: none;
          cursor: pointer;
          border-radius: 2px;
        }
        .modal-cancel {
          padding: 9px 20px;
          background: none;
          border: 1px solid #112233;
          color: #78909c;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          cursor: pointer;
          border-radius: 2px;
        }

        .config-viewer {
          background: #05080a;
          border: 1px solid #112233;
          border-radius: 2px;
          padding: 16px;
          font-size: 11px;
          color: #78909c;
          max-height: 320px;
          overflow-y: auto;
          white-space: pre-wrap;
          word-break: break-all;
          line-height: 1.6;
          width: 100%;
          font-family: monospace;
          resize: vertical;
        }

        .empty-state {
          text-align: center;
          padding: 60px 24px;
          color: #78909c;
          font-size: 13px;
        }
        .empty-state .icon {
          font-size: 40px;
          margin-bottom: 16px;
        }

        .lb-section {
          margin-bottom: 36px;
          padding-bottom: 32px;
          border-bottom: 1px solid #112233;
        }
        .lb-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 14px;
        }
        .lb-table th {
          font-family: 'Orbitron', monospace;
          font-size: 9px;
          font-weight: 700;
          color: #78909c;
          letter-spacing: 3px;
          text-align: left;
          padding: 8px 14px;
          border-bottom: 1px solid #112233;
          text-transform: uppercase;
        }
        .lb-table td {
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          color: #cfd8dc;
          padding: 10px 14px;
          border-bottom: 1px solid rgba(17, 34, 51, 0.6);
          vertical-align: middle;
        }
        .lb-table tr:hover td {
          background: rgba(0, 230, 118, .03);
        }
        .lb-rank {
          font-family: 'Orbitron', monospace;
          color: #ffab40;
          font-size: 13px;
          width: 40px;
        }
        .lb-rank.gold { color: #ffd700; }
        .lb-rank.silver { color: #c0c0c0; }
        .lb-rank.bronze { color: #cd7f32; }
        .lb-team {
          color: #00e676;
          letter-spacing: 2px;
        }
        .lb-time {
          color: #ffab40;
          font-size: 11px;
          letter-spacing: 1px;
        }
        .lb-duration {
          color: #78909c;
          font-size: 11px;
          font-weight: 700;
        }
        .lb-level {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 2px;
          font-size: 10px;
          letter-spacing: 1px;
        }
        .lb-level.done {
          background: rgba(0, 230, 118, .1);
          border: 1px solid #00e676;
          color: #00e676;
        }
        .lb-empty {
          text-align: center;
          padding: 32px;
          color: #78909c;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
        }
        .lb-refresh, .lb-clear {
          padding: 6px 16px;
          background: none;
          border: 1px solid #112233;
          color: #78909c;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          cursor: pointer;
          border-radius: 2px;
          transition: all .15s;
        }
        .lb-refresh:hover {
          border-color: #00e676;
          color: #00e676;
        }
        .lb-clear:hover {
          border-color: #ff5252;
          color: #ff5252;
        }

        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 300;
          background: #0c1318;
          border: 1px solid #00e676;
          color: #00e676;
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          padding: 10px 20px;
          border-radius: 2px;
          opacity: 0;
          pointer-events: none;
          transition: opacity .3s;
          letter-spacing: 1px;
        }
        .toast.show {
          opacity: 1;
        }
        .toast.show.err {
          border-color: #ff5252;
          color: #ff5252;
        }
      `}</style>
    </>
  )
}

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
