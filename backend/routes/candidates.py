from fastapi import APIRouter, Body, File, UploadFile, HTTPException, status, Depends, Form
from fastapi.responses import JSONResponse
from typing import List, Optional
from models import CandidateModel
from database import candidates_collection, calls_collection, jobs_collection
from services.resume_parser import extract_text_from_pdf, parse_resume_with_llm
from services.pre_screening import calculate_fit_score
from bson import ObjectId
from datetime import datetime
from routes.auth import get_current_user
import httpx
import os

router = APIRouter()

@router.post("/upload", response_description="Upload resume and create candidate", response_model=CandidateModel)
async def upload_resume(
    file: UploadFile = File(...), 
    job_id: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_content = await file.read()
    
    # 1. Extract text
    resume_text = extract_text_from_pdf(file_content)
    if not resume_text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")

    # 2. Parse with LLM
    parsed_data = parse_resume_with_llm(resume_text)
    if not parsed_data:
        raise HTTPException(status_code=500, detail="Failed to parse resume data")

    # 3. Construct Candidate Model
    candidate_data = {
        "fullName": parsed_data.get("fullName", "Unknown"),
        "email": parsed_data.get("email", ""),
        "phone": parsed_data.get("phone", ""),
        "experience": parsed_data.get("experience", []),
        "exp_type": parsed_data.get("exp_type", "Fresher"),
        "years_of_experience": parsed_data.get("years_of_experience", 0),
        "skills": parsed_data.get("skills", []),
        "company_experience": parsed_data.get("company_experience", []),
        "resume_text": resume_text,
        "parsed_data": parsed_data,
        "created_at": datetime.utcnow()
    }
    
    # Add job_id if provided
    if job_id:
        candidate_data["job_id"] = job_id
        
        # 3.5. PRE-SCREENING: Compare resume with job requirements
        job = await jobs_collection.find_one({"_id": ObjectId(job_id)})
        if job:
            print(f"🔍 Starting pre-screening for {parsed_data.get('fullName')}...")
            pre_screen_result = calculate_fit_score(parsed_data, job)
            
            # Add pre-screening results to candidate data
            candidate_data["fit_score"] = pre_screen_result.get("fit_score", 0)
            candidate_data["pre_screen_status"] = pre_screen_result.get("decision", "proceed")
            candidate_data["pre_screen_reason"] = pre_screen_result.get("reason", "")
            candidate_data["matching_skills"] = pre_screen_result.get("matching_skills", [])
            candidate_data["missing_skills"] = pre_screen_result.get("missing_skills", [])
            
            print(f"📊 Pre-screening result: {pre_screen_result.get('decision').upper()} (Score: {pre_screen_result.get('fit_score')})")
        else:
            # No job found, mark as pending for manual review
            candidate_data["pre_screen_status"] = "proceed"
            candidate_data["fit_score"] = 50

    # 4. Save to MongoDB
    new_candidate = await candidates_collection.insert_one(candidate_data)
    created_candidate = await candidates_collection.find_one({"_id": new_candidate.inserted_id})
    
    return created_candidate

@router.get("/", response_description="List all candidates", response_model=List[CandidateModel])
async def list_candidates(current_user: dict = Depends(get_current_user)):
    candidates = []
    cursor = candidates_collection.find().sort("created_at", -1)
    async for document in cursor:
        candidates.append(document)
    return candidates

@router.post("/{id}/call", response_description="Trigger outgoing call")
async def trigger_call(id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
         raise HTTPException(status_code=400, detail="Invalid ID format")

    candidate = await candidates_collection.find_one({"_id": ObjectId(id)})
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Check pre-screening status - prevent calls for rejected candidates
    pre_screen_status = candidate.get("pre_screen_status")
    fit_score = candidate.get("fit_score", 0)
    
    if pre_screen_status == "reject":
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot call candidate: Pre-screening failed (Fit Score: {fit_score}/100). Reason: {candidate.get('pre_screen_reason', 'Not qualified')}"
        )

    # Fetch Job Details
    job_details = "General Role"
    job_requirements = []
    if candidate.get("job_id") and ObjectId.is_valid(candidate.get("job_id")):
        job = await jobs_collection.find_one({"_id": ObjectId(candidate.get("job_id"))})
        if job:
            job_details = job.get("title", "General Role")
            job_requirements = job.get("requirements", [])

    candidate_name = candidate.get("fullName", "Candidate")
    skills = candidate.get("skills", [])
    company_experience = candidate.get("company_experience", [])
    
    # Focus on skills matching job requirements (prioritize relevant skills)
    relevant_skills = [s for s in skills if s in job_requirements] if job_requirements else skills[:6]
    # If no match, take top 6 skills from resume
    if not relevant_skills:
        relevant_skills = skills[:6]
    
    # Construct AI Prompt - OPTIMIZED FOR VOICE LATENCY
    prompt = f"""You are Anitha, a recruiter calling {candidate_name} for {job_details}.

VOICE RULES (CRITICAL):
- Use ONE consistent voice throughout the entire call
- Speak naturally at normal pace - not too fast or slow
- Keep responses under 15 words
- Pause 1 second after each question
- No filler words like "um", "actually", "basically"

CALL SCRIPT (Follow EXACTLY):

1. GREETING (10 seconds):
"Hi {candidate_name}, this is Anitha from Say It Don't Paste It. I'm calling about the {job_details} role. Do you have 4 minutes?"

2. TECHNICAL QUESTIONS (Ask only 3, pick from these based on their skills):
{chr(10).join([f'   - "Describe a project where you used {skill}."' for skill in relevant_skills[:3]])}

After each answer:
- If clear: Say "Got it" then next question
- If vague: Say "Can you give an example?" (once only)
- If no answer: Say "Okay" then next question

3. LOGISTICS (30 seconds):
"What is your notice period?"
"What salary range are you expecting?"

4. CLOSING (10 seconds):
"Perfect! Thank you so much for your time {candidate_name}. Based on our discussion, we'll review your profile and get back to you within 2-3 business days. Have a great day!"

IMPORTANT - FILL EVALUATION IMMEDIATELY AFTER SAYING GOODBYE:
As soon as you finish the closing statement, you MUST fill the evaluation tool with all collected information. Do NOT wait. Fill it even if some answers were incomplete.

EVALUATE NOW:
- Did they answer with real project examples?
- Technical depth: high/medium/low
- Communication clarity: good/average/poor
- Decision: shortlisted/on_hold/rejected
- Use 'incomplete' outcome ONLY if call dropped before getting any answers"""

    # Construct Evaluation Tool - OPTIMIZED FOR ACCURATE DATA EXTRACTION
    evaluation_tool = {
        "name": "call_outcomes",
        "behavior": "BLOCKING",
        "parameters": {
            "type": "OBJECT",
            "required": ["outcome", "match_score", "summary", "skills_assessment", "availability", "end_reason"],
            "properties": {
                "outcome": {
                    "enum": ["shortlisted", "rejected", "on_hold", "incomplete"],
                    "type": "STRING",
                    "description": "SHORTLISTED: Strong technical answers with real examples. REJECTED: Weak answers or no relevant experience. ON_HOLD: Average performance, needs review. INCOMPLETE: Call dropped or candidate unavailable."
                },
                "match_score": {
                    "enum": ["high", "medium", "low"],
                    "type": "STRING",
                    "description": "HIGH: Gave detailed project examples, deep technical knowledge. MEDIUM: Basic understanding, some practical experience. LOW: Vague answers, theoretical knowledge only."
                },
                "summary": {
                    "type": "STRING",
                    "minLength": "150",
                    "maxLength": "600",
                    "description": "Write 3-5 sentences covering: (1) What technical questions were asked (2) Quality of candidate's answers with specific examples they mentioned (3) Communication skills (4) Overall impression. Be specific and factual."
                },
                "skills_assessment": {
                    "type": "STRING",
                    "minLength": "100",
                    "maxLength": "500",
                    "description": "For EACH skill discussed: (1) What did they claim to know? (2) Did they give real project examples? (3) Depth of knowledge: expert/intermediate/beginner. Format: 'Skill 1 - [assessment]. Skill 2 - [assessment].' Be concrete."
                },
                "availability": {
                    "type": "STRING",
                    "description": "Exact notice period mentioned by candidate. Examples: 'Immediate', '15 days', '1 month', '2 months', 'Serving notice', 'Not discussed'. Use their exact words."
                },
                "current_ctc": {
                    "type": "STRING",
                    "description": "Current salary if mentioned. Format: '5 LPA' or '8.5 LPA' or 'Not disclosed' or 'Fresher'. Include currency if stated."
                },
                "expected_ctc": {
                    "type": "STRING",
                    "description": "Expected salary if mentioned. Format: '8 LPA' or '10-12 LPA' or 'Not discussed' or 'Negotiable'. Include currency if stated."
                },
                "end_reason": {
                    "enum": ["completed", "candidate_busy", "candidate_declined", "call_dropped", "no_answer", "wrong_number"],
                    "type": "STRING",
                    "description": "Why call ended. COMPLETED: Full conversation finished. CANDIDATE_BUSY: Said not available now. CANDIDATE_DECLINED: Not interested in job. CALL_DROPPED: Technical issue. NO_ANSWER: Didn't pick up. WRONG_NUMBER: Invalid contact."
                }
            }
        },
        "description": "Extract structured evaluation data from voice screening call. Be specific and factual in all fields."
    }

    # Trigger External Call
    api_key = os.getenv("DINODIAL_PROXY_API_KEY")
    external_call_id = None
    print("prompt: ", prompt)
    print("evaluation_tool: ", evaluation_tool)
    print("api_key: ", api_key)
    if api_key:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api-dinodial-proxy.cyces.co/api/proxy/make-call/",
                    headers={"Authorization": f"Bearer {api_key}"},
                    json={
                        "prompt": prompt,
                        "evaluation_tool": evaluation_tool
                    },
                    timeout=30.0
                )
                print("Triggered Call Response: ", response.json())
                if response.status_code == 200:
                    data = response.json()
                    print("data: ", data)
                    respData = data.get("data", {})
                    external_call_id = respData.get("id")
                    print(f"External API Call Initiated: {data}")
                    status_code = data.get("status_code")
                    if status_code != 200:
                        return JSONResponse(status_code=status_code or 500, content={"message": "Failed to initiate external call"})
                else:
                    print(f"External API Call Failed: {response.status_code} - {response.text}")
                    return JSONResponse(status_code=500, content={"message": "Failed to initiate external call"})
        except Exception as e:
            print(f"External API Call Error: {e}")
            return JSONResponse(status_code=500, content={"message": "Failed to initiate external call"})

    # Fallback ID if API call failed or keys missing (for dev/testing)
    if not external_call_id:
        external_call_id = f"mock-call-{ObjectId()}"

    # Create a new call record
    new_call = {
        "candidate_id": id,
        "status": "In-Progress",
        "start_time": datetime.utcnow(),
        "end_time": None,
        "summary": None,
        "transcript": None,
        "external_call_id": str(external_call_id)
    }
    
    result = await calls_collection.insert_one(new_call)
    
    return JSONResponse(status_code=200, content={
        "message": f"Call triggered for candidate {candidate.get('fullName')}", 
        "candidate_id": id,
        "call_id": str(result.inserted_id),
        "external_call_id": str(external_call_id)
    })
