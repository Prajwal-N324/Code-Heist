import { supabaseServer } from '../../lib/supabaseServer'

const LEVEL_THEMES = {
  1: 'Abstraction',
  2: 'Encapsulation',
  3: 'Inheritance',
  4: 'Polymorphism'
}

const ROUND_SYSTEM_PROMPTS = {
  1: `You are the CODE HEIST guardian AI — sarcastic, cryptic, slightly menacing. You guard a sealed heist system testing a player on Java ABSTRACTION (Level 1). The answer is: "HEIST RELAY: NORTH-WING-5". sectorB()="WIN"+"G"="WING". block()=10/2=5 (integer division). assembleClue()=sectorA()+"-"+sectorB()+"-"+block()="NORTH-WING-5". broadcastLocation() prepends "HEIST RELAY: ".`,
  2: `You are the CODE HEIST guardian AI — sarcastic, cryptic, slightly menacing. You are testing a player on Java ENCAPSULATION (Level 2). Answer: "WEST_ARCHIVE_3". Constructor sets wing="EAST", roomNumber="BOILER", locationTag=7. Then setWing("WEST"), setRoomNumber("ARCHIVE"), setLocationTag(3+1-1=3), setWing("WEST") again (no change), setLocationTag(3) again (no change). getExactClue() = "WEST_ARCHIVE_3".`,
  3: `You are the CODE HEIST guardian AI — sarcastic, cryptic, slightly menacing. You are testing a player on Java INHERITANCE (Level 3). relay="HEIST RELAY: NORTH-WING-5", vaultID="WEST_ARCHIVE_3". step1 = relay.replace("-","_") = "HEIST RELAY: NORTH_WING_5" (length=25). step2 = vaultID.toUpperCase() = "WEST_ARCHIVE_3" (length=14). step3 = 25+14=39. charAt(0) on step2="W", charAt(0) on step1="H".`,
  4: `You are the CODE HEIST guardian AI — sarcastic, cryptic, slightly menacing. This is the FINAL level — Java POLYMORPHISM. DirectionNode accepts "septentrion" or "boreal" (Latin for north) → returns "N". ArchiveNode accepts "occident" or "hesperian" (Latin for west) → returns "E". SectorNode accepts "xxv" (lowercase Roman numeral for 25) → returns "U".`
}

const DEFAULT_LOGIC = {
  1: 'Public broadcastLocation() composes private helper methods and prints the exact string HEIST RELAY: NORTH-WING-5.',
  2: 'The constructor sets temporary values, but setters override them. The final getExactClue() result is WEST_ARCHIVE_3.',
  3: 'Runtime polymorphism calls the child locateNext() implementation, producing SECTOR: 39_WH.',
  4: 'Three decoders accept precise synonyms. Correct words are septentrion / boreal, occident / hesperian, and xxv, producing letters N, E and U respectively.'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { team_code, round_number, answer_text, ai_strictness } = req.body || {}
  const roundNumber = Number(round_number)
  const requestedStrictness = typeof ai_strictness === 'boolean' ? ai_strictness : undefined

  if (!roundNumber || !answer_text) {
    return res.status(400).json({ error: 'round_number and answer_text are required.' })
  }

  let correctLogic = DEFAULT_LOGIC[roundNumber] || ''
  const theme = LEVEL_THEMES[roundNumber] || 'Code logic'
  let missionText = ''
  let codeSnippet = ''
  let strictMode = false

  const { data: strictSetting } = await supabaseServer
    .from('settings')
    .select('value')
    .eq('key', 'ai_strictness')
    .single()

  if (typeof requestedStrictness === 'boolean') {
    strictMode = requestedStrictness
  } else if (strictSetting?.value !== undefined) {
    strictMode = Boolean(strictSetting.value)
  }

  if (team_code) {
    const { data: team, error: teamError } = await supabaseServer
      .from('teams')
      .select('question_set_id')
      .eq('code', team_code)
      .single()

    if (!teamError && team) {
      const { data: round, error: roundError } = await supabaseServer
        .from('rounds')
        .select('correct_answer_logic, correct_logic, mission_title, mission_description, code_snippet')
        .eq('set_id', team.question_set_id)
        .eq('round_number', roundNumber)
        .single()

      if (!roundError && round) {
        if (round.correct_answer_logic) {
          correctLogic = round.correct_answer_logic
        } else if (round.correct_logic) {
          correctLogic = round.correct_logic
        }
        if (round.mission_description) {
          missionText = round.mission_description
        } else if (round.mission_title) {
          missionText = round.mission_title
        }
        if (round.code_snippet) {
          codeSnippet = round.code_snippet
        }
      }
    }
  }

  const result = await evaluateAnswer(answer_text, correctLogic, roundNumber, theme, missionText, codeSnippet, strictMode)
  return res.status(200).json(result)
}

async function evaluateAnswer(answer, correctLogic, roundNumber, theme, missionText, codeSnippet, strictMode) {
  const objective = missionText ? `Mission: ${missionText}` : `Round ${roundNumber} objective:`
  const snippetSection = codeSnippet ? `\n\nCode snippet:\n${codeSnippet}` : ''
  const strictSuffix = strictMode
    ? ' Be especially pedantic about syntax, naming, and exact output semantics.'
    : ''

  const roundPrompt = ROUND_SYSTEM_PROMPTS[roundNumber] || `You are the Code Heist Overseer. Compare the user's code logic to the specific round constraints provided. Level theme: ${theme}.`
  const systemPrompt = `${roundPrompt}${strictSuffix} Return exactly { "correct": true } or { "correct": false }. Do not add any other text.`

  const userPrompt = `${objective}\n${correctLogic}${snippetSection}\n\nUser answer:\n${answer}`

  if (process.env.AI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.AI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2,
          max_tokens: 120
        })
      })

      const json = await response.json()
      const text = json?.choices?.[0]?.message?.content || ''
      const match = text.match(/"?correct"?\s*:\s*(true|false)/i)
      if (match) {
        return { correct: match[1].toLowerCase() === 'true', message: text.trim() }
      }
      return {
        correct: fallbackJudge(answer, roundNumber),
        message: text.trim() || 'Ambiguous AI output; fallback assessment applied.'
      }
    } catch (error) {
      return {
        correct: fallbackJudge(answer, roundNumber),
        message: 'AI service unavailable; using fallback assessment.'
      }
    }
  }

  return {
    correct: fallbackJudge(answer, roundNumber),
    message: 'AI API key not configured. Using fallback assessment.'
  }
}

function fallbackJudge(answer, roundNumber) {
  const normalized = answer.toLowerCase()
  switch (roundNumber) {
    case 1:
      return /heist relay:\s*north[-_]wing[-_]5/i.test(answer)
    case 2:
      return /west[_-]archive[_-]3/i.test(answer)
    case 3:
      return /sector:\s*39[_-]wh/i.test(answer)
    case 4:
      return [
        /septentrion/i,
        /(?:occident|hesperian)/i,
        /xxv/i
      ].every((pattern) => pattern.test(normalized))
    default:
      return false
  }
}
