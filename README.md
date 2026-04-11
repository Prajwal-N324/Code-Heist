# Code Heist: Technical Treasure Hunt 🕵️‍♂️💻

**Code Heist** is an interactive, AI-powered technical treasure hunt designed for engineering students. It gamifies Object-Oriented Programming (OOP) concepts and logical problem-solving through a multi-agent AI ecosystem.

## 🚀 Overview
Built for the students of **DSATM, Bangalore**, Code Heist challenges participants to solve complex Java puzzles. Unlike traditional coding competitions, this project utilizes a **Multi-Agent Orchestration** layer to provide real-time, automated judging and execution feedback.

## 🛠️ Tech Stack
- **AI Orchestration:** Lyzr Studio (Multi-Agent System)
- **Vector Database:** Qdrant (RAG for competition rules & OOP concepts)
- **Security Middleware:** Enkrypt AI (Prompt injection & jailbreak protection)
- **Language:** Java (JDK 17+)
- **LLM:** GPT-4o / Llama 3.3 (via Lyzr Studio)

## 🤖 Agent Architecture
The system consists of three specialized AI agents working in sync:

1. **The Compiler Agent:** A strict logic comparator that verifies if the user's solution matches the algorithmic logic of the reference code without requiring exact character-for-character matching.
2. **The Executor Agent:** A virtual JVM simulator that shows participants the console output of their code, simulating a real-time runtime environment.
3. **The Heist Judge:** An impartial evaluator backed by a **Qdrant Vector Store** containing the "Laws of the Heist" and advanced OOP principles.

## 🔒 Security & Guardrails
To prevent "cheating" or prompt hacking during the competition, we integrated **Enkrypt AI**.
- **Jailbreak Detection:** Prevents users from bypassing constraints via "DAN" or roleplay attacks.
- **PII Filtering:** Ensures student data remains private.
- **Prompt Injection Protection:** Blocks attempts to "ignore previous instructions."

## 📂 Project Structure
```text
├── src/
│   ├── Level_01_Basics.java      # OOP Encapsulation Challenges
│   ├── Level_02_Inheritance.java # Polymorphism Puzzles
│   └── Level_03_Abstraction.java # Interface & Abstract Class logic
├── docs/
│   └── code_heist_rules.txt      # Indexed in Qdrant Vector DB
└── README.md
