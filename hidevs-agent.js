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
  LYZR_EXECUTOR_AGENT_ID,
  ENKRYPT_API_KEY
} from './config.js';

/**
 * Check message security via Enkrypt AI Standalone Guardrails API.
 * This runs before every AI call to ensure no injection or PII leaks.
 */
async function checkSecurity(userMsg) {
  if (!ENKRYPT_API_KEY || ENKRYPT_API_KEY === 'YOUR_ENKRYPT_API_KEY') return { safe: true };

  try {
    const res = await fetch('https://api.enkryptai.com/guardrails/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ENKRYPT_API_KEY
      },
      body: JSON.stringify({
        text: userMsg,
        detectors: {
          injection_attack: { enabled: true },
          pii: { enabled: true, entities: ["pii", "secrets", "email"] },
          toxicity: { enabled: true }
        }
      })
    });

    if (res.ok) {
      const data = await res.json();
      // If any detector finds a violation, it will have a 'detected' or similar flag
      // Based on Enkrypt standalone docs, we check for detection results
      const detected = data?.detector_results?.injection_attack?.detected || 
                       data?.detector_results?.pii?.detected ||
                       data?.detector_results?.toxicity?.detected;
      
      if (detected) {
        return { safe: false, reason: 'SECURITY VIOLATION DETECTED: Prompt blocked by Enkrypt AI.' };
      }
    }
  } catch (err) {
    console.warn('[Enkrypt] Pre-check failed, continuing with caution:', err);
  }
  return { safe: true };
}

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
  // 1. Security Pre-check (Standalone Enkrypt)
  const security = await checkSecurity(userMsg);
  if (!security.safe) {
    return `[HEIST SECURITY BLOCK] ${security.reason}`;
  }

  // 2. Select the right agent based on mode
  let agentId;
  switch (mode) {
    case 'compiler': agentId = LYZR_COMPILER_AGENT_ID; break;
    case 'executor':  agentId = LYZR_EXECUTOR_AGENT_ID; break;
    default:          agentId = LYZR_JUDGE_AGENT_ID;    break; // 'judge' and 'hint'
  }

  // 3. Fallback guard
  if (!LYZR_API_KEY || LYZR_API_KEY.includes('YOUR_')) {
    return '[HEIST CONFIG ERROR] Lyzr API key not set in config.js.';
  }
  if (!agentId || agentId.includes('YOUR_')) {
    return `[HEIST CONFIG ERROR] Lyzr ${mode.toUpperCase()} Agent ID not set in config.js.`;
  }

  // 4. Simplified Payload to fix 422 error on unpaid tiers
  const payload = {
    user_id:    userId    || 'heist-player',
    agent_id:   agentId,
    session_id: sessionId || 'default-session',
    message:    userMsg
  };

  try {
    const res = await fetch(LYZR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         LYZR_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Lyzr] HTTP error:', res.status, errText);
      return `[HEIST NODE ERROR ${res.status}] Intelligence layer unavailable. Try again.`;
    }

    const data = await res.json();
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
