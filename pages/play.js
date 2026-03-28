import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

const LEVELS = [
  {
    number: 1,
    slug: 'abstraction',
    title: 'ABSTRACTION',
    subtitle: 'The Private Vault · North Wing Sector',
    concept: 'public → private call chain',
    mission: 'MISSION ACTIVE — PRIVATE VAULT',
    accent: '#00e676',
    accentSoft: 'rgba(0, 230, 118, 0.08)',
    accentAlt: '#ffab40',
    story: `The first guardian, VaultGuard, hides its secrets behind private methods. You can only call broadcastLocation() — the single public entry point. Every private method leaves a trace. Trace the chain, then type the exact printed output in the editor on the right.`,
    codeFilename: 'VaultGuard.java',
    codeTag: 'JAVA · READ ONLY',
    codeSnippet: `public class VaultGuard {
  
  private String sectorA() {
    return "NORTH";
  }

  private String sectorB() {
    return "WIN" + "G";
  }

  private int block() {
    return 10 / 2;
  }

  private String assembleClue() {
    return sectorA() + "-" + sectorB() + "-" + block();
  }

  public void broadcastLocation() {
    System.out.println("HEIST RELAY: " + assembleClue());
  }

  public static void main(String[] args) {
    VaultGuard v = new VaultGuard();
    v.broadcastLocation();
  }
}`,
    hintItems: [
      'broadcastLocation() is your ONLY public entry point.',
      'sectorB() is string concatenation — "WIN" + "G" evaluates to what?',
      'block() uses integer division — 10 / 2 in Java is not a decimal.',
      'assembleClue() joins with dashes. The prefix is "HEIST RELAY: "'
    ],
    editorBadge: 'SUBMIT TO UNLOCK',
    editorInstruction: 'Trace the code on the left. Type the exact output that broadcastLocation() would print to the console, then hit SUBMIT CODE.',
    submitLabel: 'SUBMIT CODE ↵',
    location: 'North Wing — Locker 5',
    botHint: 'Trace the private call chain · collect letter N →',
    success: {
      title: 'VAULT CRACKED',
      subtitle: 'LETTER SECURED',
      letter: 'N',
      next: 'The abstraction is broken. The private vault reveals its secret. Your next destination: North Wing — Locker 5.'
    }
  },
  {
    number: 2,
    slug: 'encapsulation',
    title: 'ENCAPSULATION',
    subtitle: 'The Jumbled Code Box · West Corridor Sector',
    concept: 'constructor vs setters · final object state',
    mission: 'MISSION ACTIVE — JUMBLED CODE BOX',
    accent: '#40c4ff',
    accentSoft: 'rgba(64, 196, 255, 0.08)',
    accentAlt: '#ffab40',
    story: `The second guardian, DataVault, hides its fields as private. The constructor sets initial values — but it lies. After construction, multiple setter calls override the state one by one. Trace every setter in order, find the final state, then type the exact output of getExactClue().`,
    codeFilename: 'DataVault.java',
    codeTag: 'JAVA · READ ONLY',
    codeSnippet: `public class DataVault {

  private String roomNumber = "DUMMY";
  private int    locationTag = 999;
  private String wing = "SOUTH";

  public DataVault() {
    this.roomNumber = "BOILER";
    this.locationTag = 7;
    this.wing = "EAST";
  }

  public void setRoomNumber(String r) { roomNumber = r; }
  public void setLocationTag(int t)    { locationTag = t; }
  public void setWing(String w)        { wing = w; }

  public String getRoomNumber()  { return roomNumber; }
  public int    getLocationTag() { return locationTag; }
  public String getWing()        { return wing; }

  public String getExactClue() {
    return getWing() + "_" + getRoomNumber() + "_" + getLocationTag();
  }

  public static void main(String[] args) {
    DataVault dv = new DataVault();

    dv.setWing("WEST");
    dv.setRoomNumber("ARCHIVE");
    dv.setLocationTag(3 + 1 - 1);
    dv.setWing("WEST");
    dv.setLocationTag(3 + 1 - 1);

    System.out.println(dv.getExactClue());
  }
}`,
    hintItems: [
      'The constructor sets initial values — but setters OVERRIDE them afterward.',
      'Trace every setter call IN ORDER — each one updates the object\'s state.',
      'Evaluate arithmetic: 3 + 1 - 1 = ? Think carefully.',
      'getExactClue() reads the FINAL state. Format: WING_ROOMNAME_NUMBER.'
    ],
    editorBadge: 'SUBMIT TO UNLOCK',
    editorInstruction: 'Trace every setter in order. Type the exact return value of getExactClue() — what System.out.println would print — then hit SUBMIT CODE.',
    submitLabel: 'SUBMIT CODE ↵',
    location: 'West Corridor — Archive Room, Shelf 3',
    botHint: 'Trace every setter in order · collect letter E →',
    success: {
      title: 'DATA EXPOSED',
      subtitle: 'ENCAPSULATION CRACKED',
      letter: 'E',
      next: 'The setters told the truth. The constructor lied. Your next destination: West Corridor — Archive Room, Shelf 3.'
    }
  },
  {
    number: 3,
    slug: 'inheritance',
    title: 'INHERITANCE',
    subtitle: 'The Clue Chain · Sector 25 West Node',
    concept: '@Override · runtime polymorphism',
    mission: 'MISSION ACTIVE — CLUE CHAIN',
    accent: '#64ffda',
    accentSoft: 'rgba(100, 255, 218, 0.08)',
    accentAlt: '#ffab40',
    story: `The third guardian, HeistMap, inherits from SystemLog. The parent's locateNext() returns an ERROR — it is a trap. HeistMap overrides it with @Override, so Java calls the child's version at runtime, even when the reference type is SystemLog. Substitute your clues and trace the override.`,
    codeFilename: 'HeistMap.java',
    codeTag: 'JAVA · READ ONLY',
    codeSnippet: `class SystemLog {
  protected String relay;
  protected String vaultID;

  public SystemLog(String relay, String vaultID) {
    this.relay = relay;
    this.vaultID = vaultID;
  }

  public String locateNext() {
    return "ERROR: unresolved [" + relay + "]";
  }
}

class HeistMap extends SystemLog {

  public HeistMap(String relay, String vaultID) {
    super(relay, vaultID);
  }

  @Override
  public String locateNext() {
    String step1 = relay.replace("-", "_");
    String step2 = vaultID.toUpperCase();
    int step3 = step1.length() + step2.length();
    return "SECTOR: " + step3 + "_" + step2.charAt(0) + step1.charAt(0);
  }
}

public class Level3 {
  public static void main(String[] args) {
    String clue1 = "HEIST RELAY: NORTH-WING-5";
    String clue2 = "WEST_ARCHIVE_3";

    SystemLog map = new HeistMap(clue1, clue2);
    System.out.println(map.locateNext());
  }
}`,
    hintItems: [
      'relay = clue1 = "HEIST RELAY: NORTH-WING-5"',
      'map is declared as SystemLog — but HOLDS a HeistMap. Java calls the child.',
      'The parent\'s ERROR version is a decoy. Ignore it entirely.',
      'step1: replace all "-" with "_". Count every character for length.',
      'charAt(0) returns the first character of a string.'
    ],
    editorBadge: 'SUBMIT TO UNLOCK',
    editorInstruction: 'Substitute clue1 and clue2 into the child\'s locateNext(). Type the exact string printed by System.out.println, then hit SUBMIT CODE.',
    submitLabel: 'SUBMIT CODE ↵',
    location: 'Sector 25 — West Node',
    botHint: 'Child overrides parent · collect letter X →',
    success: {
      title: 'CHAIN BROKEN',
      subtitle: 'INHERITANCE CRACKED',
      letter: 'X',
      next: 'The child overrode the parent. Runtime polymorphism revealed the path. Your next destination: Sector 25 — West Node.'
    }
  },
  {
    number: 4,
    slug: 'polymorphism',
    title: 'POLYMORPHISM',
    subtitle: 'The Synonym Lock · Sector 25 West Node',
    concept: 'interface · same method · different class behavior',
    mission: 'FINAL GUARDIAN — SYNONYM LOCK',
    accent: '#ff5252',
    accentSoft: 'rgba(255, 82, 82, 0.1)',
    accentAlt: '#b388ff',
    story: `Three decoder classes all implement HeistDecoder and expose the same decode() method. Each class accepts only one precise synonym. Feed the correct words to the correct decoder and uncover the final fragment. Wrong words return question marks. Complete the heist.`,
    codeFilename: 'Level4.java',
    codeTag: 'JAVA · READ ONLY',
    codeSnippet: `interface HeistDecoder {
  String decode(String synonym);
}

class DirectionNode implements HeistDecoder {
  public String decode(String s) {
    if (s.equals("septentrion") || s.equals("boreal"))
      return "N";
    return "?";
  }
}

class ArchiveNode implements HeistDecoder {
  public String decode(String s) {
    if (s.equals("occident") || s.equals("hesperian"))
      return "E";
    return "?";
  }
}

class SectorNode implements HeistDecoder {
  public String decode(String s) {
    if (s.equals("xxv"))
      return "U";
    return "?";
  }
}

public class Level4 {
  public static void main(String[] args) {
    HeistDecoder d1 = new DirectionNode();
    HeistDecoder d2 = new ArchiveNode();
    HeistDecoder d3 = new SectorNode();

    String syn1 = "???"; // Latin root for NORTH → d1
    String syn2 = "???"; // Classical Latin for WEST → d2
    String syn3 = "???"; // Roman numeral for 25 → d3

    String fragment = d1.decode(syn1)
                    + d2.decode(syn2)
                    + d3.decode(syn3);

    String key = fragment + "X";
    System.out.println("CODE HEIST KEY: " + key);
  }
}`,
    hintItems: [
      'All three classes implement HeistDecoder — same decode() signature, different behavior.',
      'DirectionNode only accepts a Latin root meaning "north".',
      'ArchiveNode only accepts classical Latin for "west".',
      'SectorNode only accepts the Roman numeral for 25 — lowercase only!'
    ],
    editorBadge: '⚠ FINAL CHALLENGE',
    editorInstruction: 'Replace the ??? values below with the correct synonyms. Each decoder only accepts one specific word — study the class on the left, then hit SUBMIT CODE.',
    submitLabel: 'SUBMIT CODE ↵',
    location: 'Sector 25 — West Node (Final Checkpoint)',
    botHint: 'Match each synonym to the correct decoder · complete the CODE HEIST →',
    success: {
      title: 'SYNONYM LOCK OPEN',
      subtitle: 'POLYMORPHISM CRACKED',
      letter: 'U',
      next: 'The final guardian has fallen. CODE HEIST key is complete: NEXU.'
    }
  }
]

const KEY_FRAGMENTS = ['N', 'E', 'X', 'U']

export default function Play() {
  const router = useRouter()
  const { team_code, round } = router.query
  const teamCodeParam = Array.isArray(team_code) ? team_code[0] : team_code
  const requestedRound = Number(Array.isArray(round) ? round[0] : round) || 1
  const currentRound = Math.min(Math.max(requestedRound, 1), LEVELS.length)
  const [answer, setAnswer] = useState('')
  const [hintLetter, setHintLetter] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [showOverlay, setShowOverlay] = useState(false)
  const [team, setTeam] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const level = LEVELS[currentRound - 1]

  const pageVariables = {
    '--accent': level.accent,
    '--accent-soft': level.accentSoft,
    '--accent-alt': level.accentAlt
  }

  useEffect(() => {
    if (!teamCodeParam) return
    let mounted = true
    setLoading(true)
    setStatus('Verifying team...')

    supabase
      .from('teams')
      .select('id,code,question_set_id')
      .eq('code', teamCodeParam)
      .single()
      .then(({ data, error }) => {
        if (!mounted) return
        if (error || !data) {
          setStatus('Team not found. Continuing in guest mode.')
          setTeam(null)
        } else {
          setTeam(data)
          setStatus(`Team ${data.code} loaded. Question set ${data.question_set_id}.`)
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [teamCodeParam])

  useEffect(() => {
    setAnswer('')
    setFeedback(null)
    setShowOverlay(false)
  }, [currentRound])

  const tabs = useMemo(
    () =>
      LEVELS.map((item) => (
        <div
          key={item.number}
          className={`tab ${item.number === currentRound ? 'now' : item.number < currentRound ? 'done' : 'open'}`}
        >
          <span className="tdot" />
          LEVEL {item.number}
        </div>
      )),
    [currentRound]
  )

  async function handleSubmit(event) {
    event.preventDefault()
    if (!answer.trim()) {
      setFeedback({ type: 'error', message: 'Write your answer before checking the code.' })
      return
    }

    setFeedback({ type: 'pending', message: 'AI Reasoning in progress...' })

    try {
      const response = await fetch('/api/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_code: team?.code || teamCodeParam || null,
          round_number: currentRound,
          answer_text: answer
        })
      })

      const result = await response.json()
      if (result.correct) {
        setFeedback({ type: 'success', message: `Access granted. Key Fragment Recovered: ${level.success.letter}` })
        setShowOverlay(true)
      } else {
        setFeedback({ type: 'error', message: result.message || 'The Overseer rejected your reasoning.' })
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Unable to reach the reasoning engine. Try again.' })
    }
  }

  function handleNext() {
    if (currentRound < LEVELS.length) {
      const next = currentRound + 1
      router.push(`/play?round=${next}${team?.code ? `&team_code=${encodeURIComponent(team.code)}` : ''}`)
    } else {
      router.push('/')
    }
  }

  const outputHint = useMemo(() => {
    if (feedback?.type === 'success') {
      return 'Campus location unlocked. Enter the hint letter from the field on the right.'
    }
    return level.botHint || 'Check your logic using the Code Puzzle panel before inspecting the next clue.'
  }, [feedback, level.botHint])

  return (
    <>
      <Head>
        <title>CODE HEIST — Level {currentRound}: {level.title}</title>
        <meta name="description" content={`Code Heist dynamic level engine — ${level.title}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="bg-grid" />
      <div className="glow-orb" style={{ background: `radial-gradient(circle, ${level.accentSoft} 0%, transparent 70%)` }} />

      <main className="page-shell play-shell" style={pageVariables}>
        <div className="topbar">
          <div>
            <div className="tb-logo">CODE HEIST</div>
            <div className="tb-mission">
              <span className="live-dot" />{level.mission}
            </div>
          </div>
          <div className="tb-level">LEVEL {currentRound} OF {LEVELS.length}</div>
        </div>

        <div className="level-banner">
          <div className="lv-badge">0{currentRound}</div>
          <div className="lv-info">
            <div className="lv-title">{level.title}</div>
            <div className="lv-subtitle">{level.subtitle}</div>
          </div>
          <div className="lv-concept">🔒 CONCEPT: {level.concept}</div>
        </div>

        <div className="tabs">{tabs}</div>

        <div className="split">
          <div className="left-panel">
            <div className="story-box">
              <div className="story-label">▶ INTEL BRIEF</div>
              <div className="story-text">{level.story}</div>
            </div>
            <div className="code-header">
              <div className="code-filename">{level.codeFilename}</div>
              <div className="java-tag">{level.codeTag}</div>
            </div>
            <div className="code-scroll">
              <pre>{level.codeSnippet}</pre>
            </div>
            <div className="hint-box">
              <div className="hint-label">⚡ LEVEL RULES</div>
              <div className="hint-items">
                {level.hintItems.map((hint, index) => (
                  <div key={index} className="hint-item">{hint}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="right-panel">
            <div className="editor-header">
              <div className="editor-title">YOUR ANSWER</div>
              <div className="editor-badge">{level.editorBadge}</div>
            </div>
            <div className="editor-wrap">
              <div className="editor-instruction">
                {level.editorInstruction}
              </div>
              <textarea
                className="code-editor"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Type the exact printed output here…"
              />
            </div>
            <div className="result-area">
              <div className={`result-box ${(feedback?.type === 'success' || feedback?.type === 'error') ? 'show' : ''} ${feedback?.type === 'success' ? 'success' : feedback?.type === 'error' ? 'fail' : ''}`}>
                <div className="result-icon">{feedback?.type === 'success' ? '✔' : feedback?.type === 'error' ? '✗' : '…'}</div>
                <div className="result-text">
                  <div className="result-title">{feedback?.type === 'success' ? 'ACCESS GRANTED' : feedback?.type === 'error' ? 'ACCESS DENIED' : 'JUDGING'}</div>
                  <div className="result-sub">{feedback?.message || 'Submit your answer to activate the AI Overseer.'}</div>
                </div>
              </div>
            </div>
            <div className="btn-row">
              <button className="btn-submit" onClick={handleSubmit}>
                {level.submitLabel}
              </button>
            </div>
            <div className="info-card">
              <div className="info-label">Campus Location Reveal</div>
              <div className="info-copy">{level.location}</div>
            </div>
            <div className="hint-letter-panel">
              <label htmlFor="hint-letter">Physical Hint Letter Input</label>
              <input
                id="hint-letter"
                value={hintLetter}
                onChange={(event) => setHintLetter(event.target.value)}
                placeholder="Enter the hint letter found on campus"
              />
            </div>
          </div>
        </div>

        <div className="small-note">{outputHint}</div>

        <div className={`win-flash ${showOverlay ? 'show' : ''}`}>
            <div className="win-flash-title">{level.success.title}</div>
          <div className="win-flash-sub">{level.success.subtitle}</div>
          <div className="win-flash-key">Access Granted. Key Fragment Recovered: {level.success.letter}</div>
          <div className="win-flash-letter">{level.success.letter}</div>
          <div className="win-flash-next">{level.success.next}</div>
          {currentRound === LEVELS.length && (
            <div className="win-flash-final">FINAL WORD: {KEY_FRAGMENTS.join('')}</div>
          )}
          <button className="btn-wf-next" onClick={handleNext}>
            {currentRound < LEVELS.length ? `PROCEED TO LEVEL ${currentRound + 1} →` : 'FINISH HEIST'}
          </button>
        </div>
      </main>
    </>
  )
}
