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
        <title>Recruit Agents — Code Heist</title>
        <meta name="description" content="Recruit new agents from the admin hub." />
      </Head>

      <section className="auth-page">
        <div className="auth-hero">
          <p className="eyebrow">RECRUIT AGENTS</p>
          <h1>Draft new agents for the Code Heist.</h1>
          <p>
            This form is only available from the Admin Hub. Register fresh operators and assign clearance levels
            for live festival duty.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="agentName">Agent Name</label>
            <input
              id="agentName"
              value={agentName}
              onChange={(event) => setAgentName(event.target.value)}
              placeholder="Rogue One"
            />
          </div>

          <div className="form-group">
            <label htmlFor="agentCodename">Agent Codename</label>
            <input
              id="agentCodename"
              value={agentCodename}
              onChange={(event) => setAgentCodename(event.target.value)}
              placeholder="NIGHTFALL"
            />
          </div>

          <div className="form-group">
            <label htmlFor="clearance">Clearance Level</label>
            <select
              id="clearance"
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
        </form>
      </section>
    </>
  )
}
