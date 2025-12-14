# 🧠 Say It! Don't Paste It - System Architecture & Workflow

This document explains the "3-Phase Intelligent Screening" process implemented in the application.

## 🔄 The Core Workflow

### Phase 1: Resume Processing & Pre-Screening (The Filter)

1.  **Resume Upload** (`Backend: routes/candidates.py`)
    *   **Action**: User uploads a PDF resume.
    *   **Text Extraction**: `services/resume_parser.py` uses `PyPDF2` to strip text.
    *   **LLM Parsing**: The text is sent to Groq (`llama-3.3-70b-versatile`) with a prompt to extract structured JSON (Skills, Experience, Education).

2.  **Fit Score Calculation** (`Backend: services/pre_screening.py`)
    *   **Logic**: The system fetches the *Job Description* for the selected role.
    *   **Comparison**: An LLM agent compares the *Parsed Resume* vs. *Job Requirements*.
    *   **Scoring Logic**:
        *   40% Weight: Skill Match (Keywords)
        *   30% Weight: Experience Relevance (Semantic match of industry/roles)
        *   30% Weight: Tenure (Years of experience)
    *   **Decision**:
        *   **Score < 60**: Flagged as `REJECT`. System prevents accidental calls to save costs.
        *   **Score >= 60**: Flagged as `PROCEED`. Ready for Phase 2.

---

### Phase 2: Autonomous Voice Interview (The Call)

3.  **Initiating the Call** (`Backend: routes/candidates.py`)
    *   **Endpoint**: `POST /api/candidates/{id}/call`
    *   **Preparation**: System prepares a "Persona" for the AI Agent (named Anitha).
    *   **Context Injection**: The prompt is significantly customized:
        *   "You are interviewing {Name} for the {Job Title} role."
        *   "Ask about their experience with {Skill 1, Skill 2}." (Top matching skills).
    *   **API Request**: Sends a request to `https://api-dinodial-proxy.cyces.co/api/proxy/make-call/` with:
        *   `phoneNumber`: Candidate's number.
        *   `systemPrompt`: The rich persona + context.
        *   `tools`: A defined "Evaluation Tool" (JSON Schema) used in Phase 3.

4.  **The Conversation** (External Voice Provider)
    *   The AI agent dials the candidate.
    *   It follows the `CALL FLOW` instructions in the prompt (Greeting -> Tech Questions -> Behavioral -> Logistics).
    *   It reacts dynamically to candidate answers.

---

### Phase 3: Post-Call Analysis & Evaluation (The Decision)

5.  **Information Extraction** (During Call)
    *   The Voice Agent uses the `evaluation_tool` defined in the initiate payload.
    *   It **must** fill this tool before ending the call or immediately after.
    *   **Fields Extracted**:
        *   `outcome`: Shortlisted, On-Hold, Rejected.
        *   `match_score`: High, Medium, Low.
        *   `skills_assessment`: "Skill X: Strong/Weak because..."
        *   `summary`: A 3-sentence summary of the conversation.

6.  **Status Check & Sync** (`Backend: call_status_checker.py`)
    *   **Background Task**: Runs every 5 seconds.
    *   **Polling**: Checks `https://api-dinodial-proxy.cyces.co/api/proxy/call/detail/{id}`.
    *   **Sync**:
        *   Downloads the **Transcript** and **Recording URL**.
        *   Retrieves the **Analysis JSON** (Outcome, Score, Summary).

7.  **Final Verdict**
    *   The database is updated with the AI's findings.
    *   **Dashboard Logic**:
        *   `Shortlisted` + `High/Medium Match` = **SELECTED (Green Badge)**.
        *   `Rejected` = **REJECTED (Red Badge)**.
        *   `Incomplete` = **Review Needed**.

---

## 🛠 Tech Stack Summary

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React + Tailwind | User Interface (Dashboard, Upload) |
| **Backend** | FastAPI (Python) | API Logic, Orchestration |
| **Database** | MongoDB | Stores Candidates, Jobs, Call Records |
| **Parsing LLM** | Groq (Llama-3) | Resume Extraction & Pre-screening |
| **Voice AI** | Dinodial Proxy | Real-time telephony & Conversation |
| **Evaluation** | Function Calling | Structured data extraction from voice |
