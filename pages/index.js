import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const LEVEL_OVERVIEW = [
  { code: 'L-01', name: 'Abstraction', tag: 'trace public → private' },
  { code: 'L-02', name: 'Encapsulation', tag: 'follow the setters' },
  { code: 'L-03', name: 'Inheritance', tag: 'child overrides parent' },
  { code: 'L-04', name: 'Polymorphism', tag: 'same method, right class' }
]

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const secretSequence = 'heistadmin'
    let buffer = ''

    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if (key.length !== 1 || key < 'a' || key > 'z') {
        return
      }

      buffer += key
      if (!secretSequence.startsWith(buffer)) {
        buffer = key
      }

      if (buffer === secretSequence) {
        router.push('/admin/leaderboard')
        buffer = ''
      }

      if (buffer.length > secretSequence.length) {
        buffer = buffer.slice(-secretSequence.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [router])

  function handleGuestStart() {
    router.push('/play?round=1')
  }

  return (
    <>
      <Head>
        <title>CODE HEIST — Inherit the Clues, Override the Competition</title>
        <meta
          name="description"
          content="Code Heist — high-security technical treasure hunt built into a dynamic Next.js experience."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="bg-scene" />
      <div className="land-glow" />
      <div className="land-glow2" />
      <div className="skyline" />

      <main className="page-shell landing-shell">
        <span className="classified-badge">TOP SECRET</span>
        <div className="nexus-logo">CODE HEIST</div>
        <div className="logo-sub">INHERIT THE CLUES, OVERRIDE THE COMPETITION</div>
        <div className="land-line" />

        <div className="film-intro-wrapper">
          <div className="film-strip-top">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`top-${index}`} className="film-hole" />
            ))}
          </div>
          <div className="film-frame">
            The city never sleeps. Neither does the CODE HEIST system.
            Four elite engineers locked down the most powerful codebase on the planet — each one
            burying a fragment of the master key inside a different OOP concept.
            One holds it in <em>abstraction</em>. One encrypted it behind <em>encapsulation</em>.
            The third passed it through <em>inheritance</em>. The last hid it in <em>polymorphism</em>.
            You've been hired for one job: <strong>crack all four levels, collect the letters, assemble the key.</strong>
          </div>
          <div className="film-strip-bottom">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`bot-${index}`} className="film-hole" />
            ))}
          </div>
        </div>

        <div className="level-grid">
          {LEVEL_OVERVIEW.map((level) => (
            <div key={level.code} className="lv-pill">
              <div className="lv-pill-icon">
                {level.code === 'L-01' ? '🔒' : level.code === 'L-02' ? '📦' : level.code === 'L-03' ? '🧬' : '🎭'}
              </div>
              <div>
                <div className="lv-name">{level.name}</div>
                <div className="lv-tag">{level.tag}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="start-btn" onClick={handleGuestStart}>
          INITIATE BREACH
        </button>
      </main>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'auto',
          zIndex: 9999,
        }}
        onClick={() => router.push('/admin/leaderboard')}
      />
    </>
  )
}
