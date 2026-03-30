import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminRegister() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [agentName, setAgentName] = useState('')
  const [agentCodename, setAgentCodename] = useState('')
  const [clearance, setClearance] = useState('01')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const authorized = sessionStorage.getItem('admin_hub_access')
    if (!authorized) {
      router.replace('/admin')
      return
    }
    setAllowed(true)
  }, [router])

  const handleSubmit = (event) => {
    event.preventDefault()
    const name = String(agentName || '').trim()
    const codename = String(agentCodename || '').trim()

    if (!name || !codename) {
      setMessage('Agent name and codename are required.')
      return
    }

    setMessage(`Agent ${codename.toUpperCase()} recruited with clearance ${clearance}.`)
    setAgentName('')
    setAgentCodename('')
    setClearance('01')
  }

  if (!allowed) {
    return null
  }

  return (
    <>
      <Head>
        <title>RECRUIT | CODE HEIST</title>
        <meta name="description" content="Recruit new agents from the admin hub." />
      </Head>

      <section className="auth-page">
        <div className="auth-browser">
          <div className="auth-window-top">
            <span className="window-dot" />
            <span className="window-dot" />
            <span className="window-dot" />
            <span className="window-title">AGENT REGISTRATION</span>
          </div>

          <div className="auth-card">
            <h2>REGISTER NEW OPERATIVE</h2>

            <div className="field-block">
              <label>AGENT NAME</label>
              <p className="field-meta">// Field identity</p>
              <input
                value={agentName}
                onChange={(event) => setAgentName(event.target.value)}
                placeholder="Rogue One"
              />
            </div>

            <div className="field-block">
              <label>CODENAME</label>
              <p className="field-meta">// Operational alias</p>
              <input
                value={agentCodename}
                onChange={(event) => setAgentCodename(event.target.value)}
                placeholder="NIGHTFALL"
              />
            </div>

            <div className="field-block">
              <label>CLEARANCE LEVEL</label>
              <p className="field-meta">//Choose a secure clearance tier</p>
              <select
                value={clearance}
                onChange={(event) => setClearance(event.target.value)}
              >
                <option value="01">01 - Field Operative</option>
                <option value="02">02 - Tactical Support</option>
                <option value="03">03 - Command</option>
              </select>
            </div>

            {message ? <div className="form-success">{message}</div> : null}

            <button type="submit" className="primary-btn">
              RECRUIT AGENT
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
