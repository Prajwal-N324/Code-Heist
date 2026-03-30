import { Groq } from 'groq-sdk'

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null

const CHALLENGES = {
  'round-1': { answer: 'HEIST RELAY: NORTH-WING-5', context: 'North Wing 5' },
  'round-2': { answer: 'WEST_ARCHIVE_3', context: 'West Archive 3' },
  'round-3': { answer: 'SECTOR: 25_W_H', context: 'Sector 25 WH' },
  'round-4': { answer: 'CODE HEIST KEY: NEXU', context: 'Key: NEXU' }
}

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim()

const isClose = (guess, answer) => {
  if (guess === answer) return false

  let distance = 0
  let i = 0
  let j = 0

  while (i < guess.length && j < answer.length) {
    if (guess[i] === answer[j]) {
      i += 1
      j += 1
      continue
    }

    distance += 1
    if (distance > 2) return false

    if (guess.length > answer.length) {
      i += 1
    } else if (answer.length > guess.length) {
      j += 1
    } else {
      i += 1
      j += 1
    }
  }

  distance += Math.abs(guess.length - i) + Math.abs(answer.length - j)
  return distance <= 2
}

const localJudge = (userSubmission, challenge) => {
  const normalizedGuess = normalize(userSubmission)
  const normalizedAnswer = normalize(challenge.answer)

  if (!normalizedGuess) {
    return { status: 'INCORRECT', hint: null, unlocked: false }
  }

  if (normalizedGuess === normalizedAnswer) {
    return { status: 'CORRECT', hint: null, unlocked: true }
  }

  if (isClose(normalizedGuess, normalizedAnswer)) {
    return {
      status: 'CLOSE',
      hint: `Almost there. Revisit ${challenge.context} and check the formatting.`,
      unlocked: false
    }
  }

  return { status: 'INCORRECT', hint: null, unlocked: false }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { roundId, userSubmission } = req.body || {}
  const challenge = CHALLENGES[roundId]

  if (!challenge) {
    return res.status(404).json({ error: 'Round not found' })
  }

  const sendLocalResult = () => {
    const result = localJudge(userSubmission, challenge)
    return res.status(200).json(result)
  }

  if (!groq) {
    console.warn('GROQ API key unavailable, using local judge fallback')
    return sendLocalResult()
  }

  try {
    const systemPrompt = `You are the CODE HEIST Overseer.
Compare the participant answer to the hidden correct answer.

HIDDEN_CORRECT_ANSWER: "${challenge.answer}"

Rules:
1. If the participant answer matches the hidden correct answer exactly (ignore case, extra spaces, and punctuation), return status: "CORRECT", hint: null, unlocked: true.
2. If the participant answer is very close (a small typo or off by 1-2 characters), return status: "CLOSE", unlocked: false, and provide a short, cryptic hint related to: ${challenge.context}.
3. Otherwise return status: "INCORRECT", hint: null, unlocked: false.
4. Do not reveal the hidden correct answer in the hint.

Respond only with valid JSON {"status": "CORRECT" | "CLOSE" | "INCORRECT", "hint": string | null, "unlocked": boolean}.`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Participant_Answer: "${userSubmission || ''}"` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    })

    const content = response.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('Empty response from Groq')
    }

    const payload = typeof content === 'string' ? JSON.parse(content) : content
    if (!payload || !payload.status) {
      throw new Error('Invalid JSON payload from Groq')
    }

    if (payload.hint && typeof payload.hint === 'string') {
      const normalizedAnswer = normalize(challenge.answer)
      const normalizedHint = normalize(payload.hint)
      if (normalizedHint.includes(normalizedAnswer)) {
        payload.hint = 'You are incredibly close! Check your spelling instead.'
      }
    }

    return res.status(200).json({
      status: payload.status,
      hint: payload.hint ?? null,
      unlocked: Boolean(payload.unlocked)
    })
  } catch (error) {
    console.error('Judge Groq failed, falling back to local judge:', error)
    return sendLocalResult()
  }
}
