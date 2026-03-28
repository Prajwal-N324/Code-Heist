import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function Leaderboard() {
  const router = useRouter()
  const [teams, setTeams] = useState([])
  const [error, setError] = useState('')
  const [authorized, setAuthorized] = useState(null)

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

    loadTeams()

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

  if (authorized !== true) {
    return null
  }

  return (
    <main className="page-shell leaderboard-shell">
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

      <style jsx global>{`
        .leaderboard-shell {
          padding: 32px 24px;
          min-height: 100vh;
          background: radial-gradient(circle at top left, rgba(255, 82, 82, 0.08), transparent 32%),
            radial-gradient(circle at bottom right, rgba(0, 230, 118, 0.08), transparent 28%),
            #04070a;
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
