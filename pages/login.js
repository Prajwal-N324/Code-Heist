import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const router = useRouter()
  const [teamNumber, setTeamNumber] = useState('')
  const [teamName, setTeamName] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    setTeamNumber(sessionStorage.getItem('ch_team') || '')
    setTeamName(sessionStorage.getItem('ch_team_name') || '')
    setAccessCode(sessionStorage.getItem('ch_access_code') || '')
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    const team = String(teamNumber || '').trim().toUpperCase()
    const name = String(teamName || '').trim()
    const code = String(accessCode || '').trim().toUpperCase()

    if (!team || !name || !code) {
      setError('Team number, team name, and access code are required.')
      return
    }

    sessionStorage.setItem('ch_team', team)
    sessionStorage.setItem('ch_team_name', name)
    sessionStorage.setItem('ch_access_code', code)
    router.push('/play')
  }

  return (
    <>
      <Head>
        <title>LOGIN | CODE HEIST</title>
        <meta name="description" content="Team authentication portal for Code Heist." />
      </Head>

      <section className="auth-page">
        <div className="auth-browser">
          <div className="auth-window-top">
            <span className="window-dot" />
            <span className="window-dot" />
            <span className="window-dot" />
            <span className="window-title">TEAM AUTHENTICATION PORTAL</span>
          </div>

          <div className="auth-card">
            <h2>ENTER YOUR CREDENTIALS</h2>
            <div className="field-block">
              <label>TEAM NUMBER</label>
              <p className="field-meta">// Provided by the organisers</p>
              <input
                value={teamNumber}
                onChange={(event) => setTeamNumber(event.target.value)}
                placeholder="e.g. TEAM-07"
                autoComplete="off"
              />
            </div>

            <div className="field-block">
              <label>TEAM NAME</label>
              <p className="field-meta">// Your team's name</p>
              <input
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="e.g. THE DEBUGGERS"
                autoComplete="off"
              />
            </div>

            <div className="field-block">
              <label>ACCESS CODE</label>
              <p className="field-meta">// Provided by the organisers</p>
              <input
                type="password"
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                placeholder=".........."
                autoComplete="off"
              />
            </div>

            {error ? <div className="form-error">{error}</div> : null}

            <button type="submit" className="primary-btn">
              INITIATE ACCESS
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
