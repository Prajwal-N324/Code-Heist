import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const router = useRouter()
  const [teamCode, setTeamCode] = useState('')
  const [teamName, setTeamName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedName = sessionStorage.getItem('ch_team_name')
    if (storedName) {
      setTeamName(storedName)
    }
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    const code = String(teamCode || '').trim().toUpperCase()
    const name = String(teamName || '').trim()

    if (!code || !name) {
      setError('Team code and team name are required.')
      return
    }

    sessionStorage.setItem('ch_team', code)
    sessionStorage.setItem('ch_team_name', name)
    router.push('/play')
  }

  return (
    <>
      <Head>
        <title>Login — Code Heist</title>
        <meta name="description" content="Login gateway for the Code Heist game." />
      </Head>

      <section className="auth-page">
        <div className="auth-hero">
          <p className="eyebrow">PLAYER GATEWAY</p>
          <h1>Secure your team into the system.</h1>
          <p>
            Enter your team code and identity to unlock the next phase of the Code Heist.
            Your session is stored in browser memory for the duration of the game.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="teamCode">Team Code</label>
            <input
              id="teamCode"
              value={teamCode}
              onChange={(event) => setTeamCode(event.target.value)}
              placeholder="NIGHT-001"
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="teamName">Team Name</label>
            <input
              id="teamName"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="Shadow Syndicate"
              autoComplete="off"
            />
          </div>

          {error ? <div className="form-error">{error}</div> : null}

          <button type="submit" className="primary-btn">
            ENTER SYSTEM
          </button>
        </form>
      </section>
    </>
  )
}
