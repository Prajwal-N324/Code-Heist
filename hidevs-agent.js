// ══════════════════════════════════════════════════════════════
//  CODE HEIST — HiDevs Intelligence Layer
//  Shared Lyzr Agent caller used by all 4 level pages.
//  Replaces callGemini() / callGroq() with callLyzrAgent().
// ══════════════════════════════════════════════════════════════

import {
  LYZR_API_KEY,
  LYZR_API_URL,
  LYZR_JUDGE_AGENT_ID,
  LYZR_COMPILER_AGENT_ID,
  LYZR_EXECUTOR_AGENT_ID
} from './config.js';

/**
 * Call a Lyzr Studio agent.
 *
 * @param {string} userMsg   - The message to send to the agent
 * @param {string} mode      - 'judge' | 'compiler' | 'executor' | 'hint'
 * @param {string} sessionId - Unique session ID (persisted per level/team)
 * @param {string} userId    - Team ID from sessionStorage
 * @returns {Promise<string>} - The agent's text response
 */
export async function callLyzrAgent(userMsg, mode = 'judge', sessionId, userId) {
  // Select the right agent based on mode
  let agentId;
  switch (mode) {
    case 'compiler': agentId = LYZR_COMPILER_AGENT_ID; break;
    case 'executor':  agentId = LYZR_EXECUTOR_AGENT_ID; break;
    default:          agentId = LYZR_JUDGE_AGENT_ID;    break; // 'judge' and 'hint'
  }

  // Fallback guard — if keys aren't configured yet
  if (!LYZR_API_KEY || LYZR_API_KEY === 'YOUR_LYZR_API_KEY') {
    return '[HEIST CONFIG ERROR] Lyzr API key not set in config.js. Complete the manual setup guide first.';
  }
  if (!agentId || agentId.startsWith('YOUR_')) {
    return `[HEIST CONFIG ERROR] Lyzr ${mode.toUpperCase()} Agent ID not set in config.js. Create the agent in studio.lyzr.ai first.`;
  }

  const payload = {
    user_id:    userId    || 'heist-player',
    agent_id:   agentId,
    session_id: sessionId || 'default-session',
    message:    userMsg,
    // Lyzr passes these through to the agent; keep empty for now
    system_prompt_variables: {},
    filter_variables: {},
    features: []
  };

  try {
    const res = await fetch(LYZR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key':    LYZR_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Lyzr] HTTP error:', res.status, errText);
      return `[HEIST NODE ERROR ${res.status}] Intelligence layer unavailable. Try again.`;
    }

    const data = await res.json();

    // Lyzr returns the text in data.response
    const text = data?.response || data?.message || data?.output || '';
    if (!text) {
      console.error('[Lyzr] Unexpected response shape:', data);
      return '[HEIST NODE ERROR] Empty response from intelligence layer.';
    }

    return text;

  } catch (err) {
    console.error('[Lyzr] Network error:', err);
    return `[HEIST LINK DOWN] ${err.message}. Check your connection.`;
  }
}

/**
 * Generate a consistent session ID for a given team + level.
 * Persisted in sessionStorage so the same conversation is resumed.
 */
export function getSessionId(teamId, levelNum) {
  const key = `ch_lyzr_session_L${levelNum}`;
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = `ch-${teamId || 'anon'}-L${levelNum}-${Date.now()}`;
    sessionStorage.setItem(key, sid);
  }
  return sid;
}
