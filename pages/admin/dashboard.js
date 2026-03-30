import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const ADMIN_PASSWORD = "admin2025"
const STORAGE_KEY = "codeheist_team_config"

const LEVEL_META = [
  { name: "Abstraction", short: "L1", color: "#00e676", hasSynonyms: false },
  { name: "Encapsulation", short: "L2", color: "#40c4ff", hasSynonyms: false },
  { name: "Inheritance", short: "L3", color: "#ffab40", hasSynonyms: false },
  { name: "Polymorphism", short: "L4", color: "#b388ff", hasSynonyms: true },
]

const DEFAULT_LEVELS = [
  {
    answer: "HEIST RELAY: NORTH-WING-5",
    letter: "N",
    nextLocation: "North Wing — Locker 5",
    hint: "Trace the public → private method chain. What does broadcastLocation() actually print?",
    task: "ABSTRACTION — Private Vault. Trace the public → private call chain. Which output does broadcastLocation() actually print? Submit the EXACT string.",
    question: "",
    options: [
      { l: "A", t: "HEIST RELAY: NORTH-WIN-5" },
      { l: "B", t: "HEIST RELAY: NORTH-WING-5" },
      { l: "C", t: "HEIST RELAY: NORTH-WING-10" },
      { l: "D", t: "HEIST RELAY: NORTHWING5" }
    ]
  },
  {
    answer: "WEST_ARCHIVE_3",
    letter: "E",
    nextLocation: "West Corridor — Archive Room, Shelf 3",
    hint: "The constructor values don't matter — only the FINAL state after all setters run matters.",
    task: "ENCAPSULATION — Jumbled Code Box. The constructor sets values — but setters are called AFTER it. Trace every setter call in order and find the object's FINAL state. Submit the exact output of getExactClue().",
    question: ""
  },
  {
    answer: "SECTOR: 39_WH",
    letter: "X",
    nextLocation: "Sector 25 — West Node",
    hint: "Java calls the RUNTIME type's method, not the declared type. The child's @Override wins.",
    task: "INHERITANCE — Clue Chain. Your L1 & L2 outputs are already substituted. Trace through the CHILD's overridden locateNext(). The parent outputs ERROR — ignore it. Submit the exact printed output.",
    question: ""
  },
  {
    answer: "CODE HEIST KEY: NEXU",
    letter: "U",
    nextLocation: null,
    hint: "Same method name does NOT mean same behavior. Match each synonym to its EXACT decoder class.",
    task: "POLYMORPHISM — Synonym Lock. Use the synonym sheet. Match each synonym to the correct decoder class. Same interface decode() — but each class only accepts ONE specific synonym. Wrong class = '?'. Submit the final printed output.",
    question: "",
    synonymSheet: {
      north: ["compass", "septentrion", "boreal", "zenith"],
      west: ["occident", "dextral", "leftward", "hesperian"],
      num25: ["score+5", "five-squared", "xxv", "binary-11001"]
    },
    correctSynonyms: { north: "septentrion", west: "occident", num25: "xxv" }
  }
]

export default function AdminDashboard() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [allConfig, setAllConfig] = useState({})
  const [currentTeam, setCurrentTeam] = useState(null)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [saveStatus, setSaveStatus] = useState('')
  const [toast, setToast] = useState('')

  // Check login on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('admin_auth')
      if (auth === 'true') {
        setIsLoggedIn(true)
        loadConfig()
      }
    }
  }, [])

  const loadConfig = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setAllConfig(raw ? JSON.parse(raw) : {})
    } catch (e) {
      setAllConfig({})
    }
  }

  const saveConfig = (newConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig))
    setAllConfig(newConfig)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('admin_auth', 'true')
      setIsLoggedIn(true)
      loadConfig()
      setPassword('')
    } else {
      setError('⬛ Access denied. Wrong password.')
      setPassword('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    setIsLoggedIn(false)
    setCurrentTeam(null)
    setPassword('')
  }

  const getTeamConfig = (team) => {
    const config = { ...allConfig }
    if (!config[team]) {
      config[team] = JSON.parse(JSON.stringify(DEFAULT_LEVELS))
    }
    return config
  }

  const getKnownTeams = () => {
    const stored = Object.keys(allConfig)
    const defaults = ["TEAM-01", "TEAM-02", "TEAM-03", "TEAM-04", "TEAM-05", "TEAM-06"]
    const all = [...new Set([...defaults, ...stored])].sort()
    return all
  }

  const selectTeam = (team) => {
    setCurrentTeam(team)
    setCurrentLevel(0)
  }

  const showToast = (msg, isError = false) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <>
        <Head>
          <title>ADMIN CONTROL — CODE HEIST</title>
          <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet" />
        </Head>

        <section className="login-shell">
          <div className="login-page-area">
            <div className="login-box">
              <div className="login-label">⬛ RESTRICTED ACCESS</div>
              <div className="login-title">CODE HEIST</div>
              <div className="login-sub">Admin Control Panel · Authorised Personnel Only</div>
              <div className="field-group">
                <label className="field-label" htmlFor="adm-pass">ADMIN PASSWORD</label>
                <input
                  className="field-input"
                  type="password"
                  id="adm-pass"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
                  autoComplete="off"
                />
              </div>
              <button className="login-btn" onClick={handleLogin}>ACCESS CONTROL PANEL</button>
              {error && <div className="login-err">{error}</div>}
            </div>
          </div>
        </section>

        <style jsx>{`
          :root {
            --bg: #05080a;
            --bg2: #080d10;
            --bg3: #0c1318;
            --border: #112233;
            --border2: #1a3344;
            --green: #00e676;
            --amber: #ffab40;
            --blue: #40c4ff;
            --red: #ff5252;
            --white: #cfd8dc;
            --muted: #78909c;
            --mono: 'Share Tech Mono', monospace;
            --ui: 'Rajdhani', sans-serif;
            --head: 'Orbitron', monospace;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            background: var(--bg);
            color: var(--white);
            font-family: var(--mono);
          }

          .login-shell {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background: var(--bg);
          }

          .login-page-area {
            width: 100%;
            max-width: 440px;
          }

          .login-box {
            background: var(--bg2);
            border: 1px solid var(--border2);
            border-radius: 4px;
            padding: 40px 36px;
          }

          .login-label {
            font-family: var(--head);
            font-size: 9px;
            color: var(--red);
            letter-spacing: 4px;
            margin-bottom: 28px;
            text-transform: uppercase;
          }

          .login-title {
            font-family: var(--head);
            font-size: 22px;
            color: var(--white);
            margin-bottom: 6px;
            letter-spacing: 3px;
          }

          .login-sub {
            font-size: 11px;
            font-weight: 700;
            color: var(--muted);
            margin-bottom: 32px;
            letter-spacing: 1px;
          }

          .field-label {
            font-size: 10px;
            font-weight: 700;
            color: var(--muted);
            letter-spacing: 2px;
            display: block;
            margin-bottom: 6px;
            text-transform: uppercase;
          }

          .field-input {
            width: 100%;
            background: var(--bg);
            border: 1px solid var(--border);
            color: var(--white);
            font-family: var(--mono);
            font-size: 13px;
            padding: 10px 14px;
            border-radius: 2px;
            outline: none;
            transition: border-color 0.2s;
          }

          .field-input:focus {
            border-color: var(--amber);
          }

          .field-group {
            margin-bottom: 20px;
          }

          .login-btn {
            width: 100%;
            padding: 12px;
            background: var(--amber);
            color: var(--bg);
            font-family: var(--head);
            font-size: 12px;
            letter-spacing: 3px;
            border: none;
            cursor: pointer;
            border-radius: 2px;
            margin-top: 8px;
            transition: opacity 0.2s;
            text-transform: uppercase;
            font-weight: 700;
          }

          .login-btn:hover {
            opacity: 0.85;
          }

          .login-err {
            color: var(--red);
            font-size: 11px;
            margin-top: 12px;
            min-height: 18px;
            letter-spacing: 1px;
          }
        `}</style>
      </>
    )
  }

  // MAIN ADMIN PANEL
  const knownTeams = getKnownTeams()
  const teamConfig = currentTeam ? getTeamConfig(currentTeam) : {}
  const currentLevelData = currentTeam ? teamConfig[currentTeam][currentLevel] : null

  return (
    <>
      <Head>
        <title>ADMIN CONTROL — CODE HEIST</title>
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="admin-shell">
        {/* TOP BAR */}
        <div className="topbar">
          <div className="tb-logo">// ADMIN</div>
          <div className="tb-badge">CODE HEIST CONTROL PANEL</div>
          <div className="tb-spacer"></div>
          <button className="tb-logout" onClick={handleLogout}>LOGOUT</button>
        </div>

        <div className="admin-body">
          {/* TEAM SELECTOR */}
          <div className="section-head">
            <div>
              <div className="section-title">// SELECT TEAM</div>
              <div className="section-sub">Choose a team to configure their level questions, answers, hints & locations.</div>
            </div>
          </div>

          <div className="team-bar">
            {knownTeams.map(team => (
              <div
                key={team}
                className={`team-pill ${currentTeam === team ? 'active' : ''}`}
                onClick={() => selectTeam(team)}
              >
                {team}
              </div>
            ))}
          </div>

          {/* LEVEL EDITOR */}
          {currentTeam && (
            <div className="editor-area">
              <div className="section-head">
                <div>
                  <div className="section-title">// {currentTeam} · LEVEL CONFIG</div>
                  <div className="section-sub">Each level can have a unique question, answer, hints and location reveal for this team.</div>
                </div>
              </div>

              {/* Level Tabs */}
              <div className="level-tabs">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`ltab ${currentLevel === i ? 'active' : ''}`}
                    onClick={() => setCurrentLevel(i)}
                  >
                    <span className="lnum">L{i + 1}</span>
                    {LEVEL_META[i].name}
                  </div>
                ))}
              </div>

              {/* Level Form */}
              <div className="level-form">
                <div className="form-grid">
                  <div className="field-group">
                    <label>CORRECT ANSWER <span>exact string player must submit</span></label>
                    <input
                      type="text"
                      defaultValue={currentLevelData?.answer || ''}
                      placeholder="exact answer string"
                    />
                    <div className="field-hint">Case-sensitive. The AI guardian checks for this exact string to unlock the next level.</div>
                  </div>
                  <div className="field-group">
                    <label>SECRET LETTER <span>unlocked when this level is solved</span></label>
                    <input
                      type="text"
                      defaultValue={currentLevelData?.letter || ''}
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
                      defaultValue={currentLevelData?.nextLocation || ''}
                      placeholder="e.g. East Wing — Room 12"
                    />
                    <div className="field-hint">Leave blank for the final level.</div>
                  </div>
                  <div className="field-group">
                    <label>HINT TEXT <span>shown when player clicks HINT</span></label>
                    <input
                      type="text"
                      defaultValue={currentLevelData?.hint || ''}
                      placeholder="indirect clue without giving away the answer"
                    />
                  </div>
                </div>

                <div className="form-grid full" style={{ marginTop: '16px' }}>
                  <div className="field-group">
                    <label>QUESTION / PUZZLE <span>the actual question shown to this team in the code panel</span></label>
                    <textarea
                      placeholder="Type the question, code snippet, or puzzle clue for this team…"
                      style={{ minHeight: '180px', fontFamily: 'monospace', fontSize: '12px' }}
                      defaultValue={currentLevelData?.question || ''}
                    />
                    <div className="field-hint">✦ This is what the team sees in the code panel. Each team gets their own unique question per level. Plain text or code — anything goes.</div>
                  </div>
                </div>

                <div className="form-grid full" style={{ marginTop: '16px' }}>
                  <div className="field-group">
                    <label>TASK DESCRIPTION <span>instruction line shown below the question</span></label>
                    <textarea
                      placeholder="e.g. Trace the method chain and submit the exact output…"
                      defaultValue={currentLevelData?.task || ''}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button className="save-btn" onClick={() => showToast('✓ Level saved successfully!')}>
                    SAVE LEVEL {currentLevel + 1}
                  </button>
                  <button className="reset-btn">RESET TO DEFAULT</button>
                  {saveStatus && <div className="save-status show">{saveStatus}</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && <div className="toast show">{toast}</div>}
      </div>

      <style jsx>{`
        :root {
          --bg: #05080a;
          --bg2: #080d10;
          --bg3: #0c1318;
          --border: #112233;
          --border2: #1a3344;
          --green: #00e676;
          --amber: #ffab40;
          --blue: #40c4ff;
          --red: #ff5252;
          --white: #cfd8dc;
          --muted: #78909c;
          --mono: 'Share Tech Mono', monospace;
          --ui: 'Rajdhani', sans-serif;
          --head: 'Orbitron', monospace;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background: var(--bg);
          color: var(--white);
          font-family: var(--mono);
        }

        .admin-shell {
          min-height: 100vh;
          background: var(--bg);
        }

        .topbar {
          background: var(--bg2);
          border-bottom: 1px solid var(--border);
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
          font-family: var(--head);
          font-size: 13px;
          color: var(--red);
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .tb-badge {
          font-size: 9px;
          font-weight: 700;
          color: var(--muted);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .tb-spacer {
          flex: 1;
        }

        .tb-logout {
          font-family: var(--mono);
          font-size: 11px;
          color: var(--muted);
          background: none;
          border: 1px solid var(--border);
          padding: 5px 14px;
          cursor: pointer;
          border-radius: 2px;
          letter-spacing: 1px;
          transition: color 0.2s, border-color 0.2s;
          text-transform: uppercase;
        }

        .tb-logout:hover {
          color: var(--red);
          border-color: var(--red);
        }

        .admin-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px 60px;
        }

        .section-head {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .section-title {
          font-family: var(--head);
          font-size: 13px;
          color: var(--amber);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .section-sub {
          font-size: 10px;
          font-weight: 700;
          color: var(--muted);
          letter-spacing: 0.5px;
        }

        .team-bar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }

        .team-pill {
          padding: 6px 18px;
          background: var(--bg2);
          border: 1px solid var(--border);
          color: var(--muted);
          font-family: var(--mono);
          font-size: 12px;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.15s;
          text-transform: uppercase;
        }

        .team-pill:hover {
          border-color: var(--border2);
          color: var(--white);
        }

        .team-pill.active {
          background: rgba(0, 230, 118, 0.08);
          border-color: var(--green);
          color: var(--green);
        }

        .editor-area {
          margin-bottom: 36px;
        }

        .level-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
        }

        .ltab {
          padding: 8px 20px;
          background: var(--bg2);
          border: 1px solid var(--border);
          color: var(--muted);
          font-family: var(--mono);
          font-size: 11px;
          cursor: pointer;
          border-radius: 2px 2px 0 0;
          transition: all 0.15s;
          text-transform: uppercase;
        }

        .ltab:hover {
          color: var(--white);
        }

        .ltab.active {
          background: var(--bg3);
          border-bottom-color: var(--bg3);
          color: var(--white);
        }

        .ltab .lnum {
          color: var(--amber);
          font-weight: bold;
          margin-right: 6px;
        }

        .level-form {
          background: var(--bg3);
          border: 1px solid var(--border);
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
          display: flex;
          flex-direction: column;
        }

        .field-group label {
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 2px;
          display: block;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .field-group label span {
          color: var(--amber);
          margin-left: 6px;
          font-size: 9px;
        }

        .field-group input,
        .field-group textarea {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--white);
          font-family: var(--mono);
          font-size: 12px;
          padding: 10px 12px;
          border-radius: 2px;
          outline: none;
          transition: border-color 0.2s;
          resize: vertical;
        }

        .field-group textarea {
          min-height: 120px;
          line-height: 1.6;
        }

        .field-group input:focus,
        .field-group textarea:focus {
          border-color: var(--blue);
        }

        .field-hint {
          font-size: 10px;
          font-weight: 700;
          color: var(--muted);
          margin-top: 5px;
          line-height: 1.5;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
          align-items: center;
        }

        .save-btn {
          padding: 10px 32px;
          background: var(--green);
          color: var(--bg);
          font-family: var(--head);
          font-size: 11px;
          letter-spacing: 2px;
          border: none;
          cursor: pointer;
          border-radius: 2px;
          transition: opacity 0.2s;
          text-transform: uppercase;
          font-weight: 700;
        }

        .save-btn:hover {
          opacity: 0.85;
        }

        .reset-btn {
          padding: 10px 20px;
          background: none;
          border: 1px solid var(--border);
          color: var(--muted);
          font-family: var(--mono);
          font-size: 11px;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.15s;
          text-transform: uppercase;
        }

        .reset-btn:hover {
          border-color: var(--red);
          color: var(--red);
        }

        .save-status {
          font-size: 11px;
          color: var(--green);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .save-status.show {
          opacity: 1;
        }

        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 300;
          background: var(--bg3);
          border: 1px solid var(--green);
          color: var(--green);
          font-family: var(--mono);
          font-size: 12px;
          padding: 10px 20px;
          border-radius: 2px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .toast.show {
          opacity: 1;
          pointer-events: auto;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .admin-body {
            padding: 24px 16px 40px;
          }

          .topbar {
            padding: 0 16px;
          }
        }
      `}</style>
    </>
  )
}
