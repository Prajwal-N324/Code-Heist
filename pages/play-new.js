import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

const LEVEL_INFO = [
  { number: 1, title: 'ABSTRACTION', color: '#00e676', colorSoft: 'rgba(0, 230, 118, 0.08)' },
  { number: 2, title: 'ENCAPSULATION', color: '#40c4ff', colorSoft: 'rgba(64, 196, 255, 0.08)' },
  { number: 3, title: 'INHERITANCE', color: '#64ffda', colorSoft: 'rgba(100, 255, 218, 0.08)' },
  { number: 4, title: 'POLYMORPHISM', color: '#ff5252', colorSoft: 'rgba(255, 82, 82, 0.1)' }
]

const CORRECT_ANSWERS = {
  1: 'HEIST RELAY: NORTH-WING-5',
  2: 'WEST_ARCHIVE_3',
  3: 'SECTOR: 39_WH',
  4: 'CODE HEIST KEY: NEXU'
}

export default function Play() {
  const router = useRouter()
  const [currentLevel, setCurrentLevel] = useState(1)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [team, setTeam] = useState(null)
  const [levelData, setLevelData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lettersCollected, setLettersCollected] = useState('')

  // Load team from session
  useEffect(() => {
    if (typeof window === 'undefined') return
    const teamId = sessionStorage.getItem('ch_team')
    const teamName = sessionStorage.getItem('ch_team_name')

    if (!teamId) {
      setError('No team found. Please register first.')
      setTimeout(() => router.push('/login'), 2000)
      return
    }

    setTeam({ id: teamId, name: teamName })
  }, [router])

  // Load level data from Supabase
  useEffect(() => {
    if (!team) return

    const loadLevelData = async () => {
      try {
        setLoading(true)
        const { data, error: queryError } = await supabase
          .from('team_level_data')
          .select('*')
          .eq('team_id', team.id)
          .eq('level', currentLevel)
          .single()

        if (queryError && queryError.code !== 'PGRST116') {
          throw queryError
        }

        if (data) {
          setLevelData(data)
        } else {
          setLevelData(null)
          setError(`No question data for level ${currentLevel}`)
        }
      } catch (err) {
        console.error('Error loading level data:', err)
        setError('Failed to load level data')
      } finally {
        setLoading(false)
      }
    }

    loadLevelData()
  }, [team, currentLevel])

  const handleSubmit = async () => {
    setFeedback(null)

    if (!answer.trim()) {
      setFeedback({ type: 'error', message: 'Please enter an answer.' })
      return
    }

    // Check answer (case-insensitive)
    const correct = CORRECT_ANSWERS[currentLevel]
    const isMatch = answer.trim().toUpperCase() === correct.toUpperCase()

    if (isMatch) {
      setIsCorrect(true)
      const letter = levelData?.letter || ''
      setLettersCollected(prev => prev + letter)

      setFeedback({
        type: 'success',
        title: `LEVEL ${currentLevel} COMPLETE!`,
        letter: letter,
        message: levelData?.next_location ? `Next: ${levelData.next_location}` : 'Final fragment secured!'
      })

      // Auto-advance after 3 seconds
      setTimeout(() => {
        if (currentLevel < 4) {
          setCurrentLevel(currentLevel + 1)
          setAnswer('')
          setIsCorrect(false)
        } else {
          // All levels complete
          sessionStorage.setItem('ch_game_complete', 'true')
          router.push('/complete')
        }
      }, 3000)
    } else {
      setFeedback({
        type: 'error',
        message: `Incorrect. Try again. Hint: ${levelData?.hint || 'Trace carefully.'}`
      })
      setAnswer('')
    }
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#ff5252', fontFamily: 'monospace' }}>
        {error}
      </div>
    )
  }

  if (!team) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#cfd8dc', fontFamily: 'monospace' }}>
        Loading...
      </div>
    )
  }

  const levelInfo = LEVEL_INFO[currentLevel - 1]
  const question = levelData?.question || 'Question not found'
  const task = levelData?.task || 'Complete the task and submit your answer'

  return (
    <>
      <Head>
        <title>Level {currentLevel} | CODE HEIST</title>
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="play-shell" style={{ '--accent': levelInfo.color, '--accent-soft': levelInfo.colorSoft }}>
        <div className="play-header">
          <div className="header-left">
            <span className="level-number">LEVEL {currentLevel}</span>
            <span className="level-title">{levelInfo.title}</span>
          </div>
          <div className="header-right">
            <span className="team-display">{team.name}</span>
            {lettersCollected && <span className="letters-display">Letters: {lettersCollected}</span>}
          </div>
        </div>

        <div className="play-content">
          {/* Left Panel - Code/Question */}
          <div className="code-panel">
            <div className="panel-header">
              <span className="panel-title">LEVEL {currentLevel} — {levelInfo.title}</span>
              <span className="panel-subtitle">READ ONLY</span>
            </div>
            <div className="panel-body">
              {loading ? (
                <div className="loading">Loading level data...</div>
              ) : (
                <>
                  <div className="question-section">
                    <div className="section-label">PUZZLE:</div>
                    <div className="question-text">{question}</div>
                  </div>
                  <div className="task-section">
                    <div className="section-label">TASK:</div>
                    <div className="task-text">{task}</div>
                  </div>
                  {levelData?.hint && (
                    <div className="hint-section">
                      <div className="section-label">💡 HINT:</div>
                      <div className="hint-text">{levelData.hint}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Answer Submission */}
          <div className="editor-panel">
            <div className="panel-header">
              <span className="panel-title">SUBMIT ANSWER</span>
              <span className="panel-subtitle">TYPE YOUR ANSWER BELOW</span>
            </div>
            <div className="panel-body">
              <textarea
                className="answer-input"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type the exact output you traced..."
                disabled={isCorrect}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === 'Enter') {
                    handleSubmit()
                  }
                }}
              />

              {feedback && (
                <div className={`feedback feedback-${feedback.type}`}>
                  {feedback.title && <div className="feedback-title">{feedback.title}</div>}
                  {feedback.letter && <div className="feedback-letter">LETTER: {feedback.letter}</div>}
                  <div className="feedback-message">{feedback.message}</div>
                </div>
              )}

              <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={isCorrect || loading}
              >
                {isCorrect ? '✓ CORRECT' : loading ? 'LOADING...' : 'SUBMIT ANSWER'}
              </button>

              {currentLevel > 1 && (
                <button
                  className="back-btn"
                  onClick={() => {
                    setCurrentLevel(currentLevel - 1)
                    setAnswer('')
                    setFeedback(null)
                    setIsCorrect(false)
                  }}
                >
                  ← PREVIOUS LEVEL
                </button>
              )}

              {currentLevel < 4 && isCorrect && (
                <button
                  className="next-btn"
                  onClick={() => {
                    setCurrentLevel(currentLevel + 1)
                    setAnswer('')
                    setFeedback(null)
                    setIsCorrect(false)
                  }}
                >
                  NEXT LEVEL →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        :root {
          --bg: #05080a;
          --bg2: #080d10;
          --bg3: #0c1318;
          --border: #112233;
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

        html, body {
          background: var(--bg);
          color: var(--white);
          font-family: var(--mono);
        }

        .play-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg);
        }

        .play-header {
          background: var(--bg2);
          border-bottom: 1px solid var(--border);
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .header-left, .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .level-number {
          font-family: var(--head);
          font-size: 11px;
          color: var(--amber);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .level-title {
          font-family: var(--head);
          font-size: 14px;
          color: var(--white);
          letter-spacing: 2px;
          font-weight: 700;
        }

        .team-display, .letters-display {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .play-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          flex: 1;
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .code-panel, .editor-panel {
          background: var(--bg3);
          border: 1px solid var(--border);
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .panel-header {
          background: var(--bg2);
          border-bottom: 1px solid var(--border);
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .panel-title {
          font-family: var(--head);
          font-size: 11px;
          color: var(--accent);
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 700;
        }

        .panel-subtitle {
          font-size: 9px;
          color: var(--muted);
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .panel-body {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .loading {
          text-align: center;
          color: var(--muted);
          padding: 40px 20px;
          font-style: italic;
        }

        .question-section, .task-section, .hint-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-label {
          font-family: var(--head);
          font-size: 10px;
          color: var(--amber);
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 700;
        }

        .question-text, .task-text, .hint-text {
          font-size: 13px;
          line-height: 1.6;
          color: var(--white);
          white-space: pre-wrap;
          word-break: break-word;
        }

        .hint-text {
          color: var(--blue);
          font-style: italic;
        }

        .answer-input {
          width: 100%;
          min-height: 200px;
          padding: 12px;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--white);
          font-family: var(--mono);
          font-size: 13px;
          line-height: 1.6;
          border-radius: 2px;
          outline: none;
          transition: border-color 0.2s;
          resize: vertical;
        }

        .answer-input:focus {
          border-color: var(--accent);
        }

        .answer-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .feedback {
          padding: 12px;
          border-radius: 2px;
          font-size: 11px;
          line-height: 1.5;
        }

        .feedback-success {
          background: rgba(0, 230, 118, 0.1);
          border: 1px solid rgba(0, 230, 118, 0.3);
          color: var(--green);
        }

        .feedback-error {
          background: rgba(255, 82, 82, 0.1);
          border: 1px solid rgba(255, 82, 82, 0.3);
          color: var(--red);
        }

        .feedback-title {
          font-weight: 700;
          margin-bottom: 4px;
          letter-spacing: 1px;
        }

        .feedback-letter {
          color: var(--amber);
          font-weight: 700;
          margin-bottom: 4px;
        }

        .feedback-message {
          opacity: 0.9;
        }

        .submit-btn, .back-btn, .next-btn {
          width: 100%;
          padding: 12px;
          margin-top: 12px;
          font-family: var(--head);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          border: none;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 700;
        }

        .submit-btn {
          background: var(--accent);
          color: var(--bg);
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .back-btn, .next-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
        }

        .back-btn:hover, .next-btn:hover {
          border-color: var(--blue);
          color: var(--blue);
        }

        @media (max-width: 1024px) {
          .play-content {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .play-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .play-content {
            padding: 12px;
            gap: 12px;
          }

          .panel-body {
            padding: 12px;
          }
        }
      `}</style>
    </>
  )
}
