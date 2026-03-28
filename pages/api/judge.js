import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// The updated challenge database for CODE HEIST
const CHALLENGES = {
  "round-1": { 
    answer: "HEIST RELAY: NORTH-WING-5", 
    hint_context: "Location in the North Wing, digit 5." 
  },
  "round-2": { 
    answer: "WEST_ARCHIVE_3", 
    hint_context: "Archive location in the West, digit 3." 
  },
  "round-3": { 
    answer: "SECTOR: 25_W_H", 
    hint_context: "Specific sector code with W and H." 
  },
  "round-4": { 
    answer: "CODE HEIST KEY: NEXU", 
    hint_context: "The final key, sounds like connection." 
  }
};

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { roundId, userSubmission } = req.body;
    const correctData = CHALLENGES[roundId];

    // 2. Validate Round ID
    if (!correctData) {
      return res.status(404).json({ error: "Round not found" });
    }

    // 3. System Prompt for Llama 3.3
    const systemPrompt = `
      You are the CODE HEIST AI Overseer. 
      Compare the Participant_Answer to the Hidden_Correct_Answer.
      
      HIDDEN_CORRECT_ANSWER: "${correctData.answer}"
      
      RULES:
      1. If the answer is 100% correct (ignore case/spacing/punctuation), status: "CORRECT" and unlocked: true.
      2. If the answer is very close (1-2 chars off or minor typo), status: "CLOSE", unlocked: false. Provide a 3-word cryptic hint related to: ${correctData.hint_context}.
      3. Otherwise, status: "INCORRECT", unlocked: false, hint: null.
      4. NEVER reveal the actual Hidden_Correct_Answer in your hint.
      
      OUTPUT ONLY VALID JSON: {"status": "string", "hint": "string|null", "unlocked": boolean}
    `;

    // 4. Call Groq API
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Using 70b for better reasoning during the fest
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Participant_Answer: "${userSubmission}"` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, 
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from LLM");
    
    let result = JSON.parse(content);
    
    // 5. Final Safety: Check if the AI leaked the answer in its hint
    if (result.hint && result.hint.toLowerCase().includes(correctData.answer.toLowerCase().split(':')[0].trim())) {
        result.hint = "You are incredibly close! Double check your spelling.";
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("Judge Error:", error);
    return res.status(500).json({ 
      status: "ERROR", 
      message: "Overseer offline. Check server logs.",
      unlocked: false 
    });
  }
}