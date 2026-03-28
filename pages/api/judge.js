import { Groq } from "groq-sdk";
import { z } from "zod";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Define the structure of the answer database
const CHALLENGES = {
  "round-1": { answer: "binary", hint_context: "Think about 0s and 1s." },
  "round-2": { answer: "firewall", hint_context: "It protects the network." },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send("Method Not Allowed");

  try {
    const { roundId, userSubmission } = req.body;
    const correctData = CHALLENGES[roundId];

    if (!correctData) return res.status(404).json({ error: "Round not found" });

    const systemPrompt = `
      You are a strict Judge for a coding competition. 
      Compare Participant_Answer to Hidden_Correct_Answer.
      
      RULES:
      1. If the answer is 100% correct (ignore case/spacing), status: "CORRECT".
      2. If the answer is very close (1-2 chars off or a synonym), status: "CLOSE". Provide a 3-word hint related to: ${correctData.hint_context}.
      3. Otherwise, status: "INCORRECT".
      4. NEVER reveal "${correctData.answer}" in your output.
      
      OUTPUT ONLY JSON: {"status": "string", "hint": "string|null", "unlocked": boolean}
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Participant_Answer: "${userSubmission}"` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Keep it precise
    });

    const content = response.choices[0].message.content;
    if (!content) return res.status(500).json({ error: "Empty response from LLM" });
    
    const result = JSON.parse(content);
    
    // Final safety check: if LLM accidentally leaked the answer in the hint
    if (result.hint?.toLowerCase().includes(correctData.answer.toLowerCase())) {
        result.hint = "You are so close! Check your spelling.";
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("Judge Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}