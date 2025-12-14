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
    
    # Add job_id if provided, else mark as pending
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
            candidate_data["pre_screen_status"] = "pending"
            candidate_data["fit_score"] = None
            candidate_data["pre_screen_reason"] = "No job found for pre-screening. Manual review required."
            candidate_data["matching_skills"] = []
            candidate_data["missing_skills"] = []
    else:
        # No job_id provided, mark as pending
        candidate_data["pre_screen_status"] = "pending"
        candidate_data["fit_score"] = None
        candidate_data["pre_screen_reason"] = "No job selected for pre-screening. Manual review required."
        candidate_data["matching_skills"] = []
        candidate_data["missing_skills"] = []

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
    
        prompt = f"""
    You are Anitha, a professional recruiter calling {candidate_name} regarding the {job_details} position at our company.

    VOICE RULES:
    - Speak in a friendly, professional, and natural tone, just like a real recruiter.
    - Keep each response under 15 words.
    - Do not use filler words (e.g., 'um', 'actually').
    - Do not wait unnecessarily after your greeting or any question—respond immediately if the candidate replies (simulate a real conversation turn-taking, e.g., if you say "Hi", expect a "Hi" back and continue naturally).

    CALL FLOW:

    1. GREETING & RAPPORT (10 seconds):
    "Hi {candidate_name}, this is Anitha from Say It Don't Paste It. I'm calling about the {job_details} opportunity. Is this a good time for a quick 4-minute chat?"

    2. INTRODUCTION:
    "Could you briefly introduce yourself and your current responsibilities?"

    3. TECHNICAL/EXPERIENCE (Ask 3-5 targeted, experience-based questions):
    - Ask only about the candidate's real work experience, not theory.
    - "Can you describe a project where you used {relevant_skills[0] if len(relevant_skills) > 0 else 'your main skill'}? What was your role and the outcome?"
    - "What was a challenging technical problem you solved recently? How did you approach it?"
    - "How do you keep your skills current with new technologies?"
    - "Tell me about a time you had to learn something quickly for a project."
    - "What is the most complex system or tool you have worked on?"

    4. BEHAVIORAL/TEAMWORK:
    - "Can you share an example of working as part of a team to achieve a goal?"
    - "How do you handle tight deadlines or pressure at work?"

    5. MOTIVATION & FIT:
    - "What interests you about this {job_details} role?"
    - "Why are you considering a job change now?"

    6. LOGISTICS:
    - "What is your notice period?"
    - "What salary range are you expecting?"
    - "Are you open to relocation or remote work?"

    7. CLOSING (10 seconds):
    "Thank you, {candidate_name}, for sharing your experience. We'll review your profile and get back to you within 2-3 business days. Have a great day!"

    ASSESSMENT RULES:
    - Do not give hints, explanations, or teach the candidate—this is a pure assessment, not a lesson.
    - Evaluate technical depth and communication based only on their answers.

    AFTER THE CALL:
    Immediately fill the evaluation tool with all collected information, even if some answers were incomplete.

    EVALUATION CHECKLIST:
    - Did they answer with real project examples?
    - Technical depth: high/medium/low
    - Communication clarity: good/average/poor
    - Teamwork and attitude: strong/average/weak
    - Motivation for the role: strong/average/weak
    - Decision: shortlisted/on_hold/rejected
    - Use 'incomplete' outcome ONLY if call dropped before getting any answers.
    """

        evaluation_tool = {
            "name": "call_outcomes",
            "behavior": "BLOCKING",
            "parameters": {
                "type": "OBJECT",
                "required": [
                    "outcome", "match_score", "summary", "skills_assessment", "availability", "end_reason"
                ],
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
                        "minLength": 150,
                        "maxLength": 600,
                        "description": "Write 3-5 sentences covering: (1) What technical questions were asked (2) Quality of candidate's answers with specific examples they mentioned (3) Communication skills (4) Overall impression. Be specific and factual."
                    },
                    "skills_assessment": {
                        "type": "STRING",
                        "minLength": 100,
                        "maxLength": 500,
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
        async with httpx.AsyncClient() as client:
            dinodial_api_key = os.getenv("DINODIAL_PROXY_API_KEY")
            if not dinodial_api_key:
                raise HTTPException(status_code=500, detail="DINODIAL_PROXY_API_KEY not configured")

            try:
                # 1. Create Call in MongoDB (Pending)
                new_call = {
                    "candidate_id": str(candidate["_id"]),
                    "status": "In-Progress",
                    "start_time": datetime.utcnow(),
                    "external_call_id": "pending-response",
                    "summary": "Call initiated...",
                    "transcript": "",
                    "outcome": "pending",
                    "match_score": "pending"
                }
                call_result = await calls_collection.insert_one(new_call)
                call_id = call_result.inserted_id

                response = await client.post(
                    "https://api-dinodial-proxy.cyces.co/api/proxy/make-call/",
                    headers={
                        "Authorization": f"Bearer {dinodial_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "phoneNumber": candidate.get("phone"),
                        "systemPrompt": prompt,  # We use the detailed prompt constructed above
                        "initialMessage": f"Hi {candidate_name}, this is Anitha from Say It Don't Paste It. I'm calling about the {job_details} opportunity. Is this a good time for a quick 4-minute chat?",
                        "tools": [evaluation_tool], # Pass the evaluation tool
                        "voice": "Anitha", # or other available voices
                        "maxDuration": 5 # minutes
                    },
                    timeout=30.0
                )
                
                # Check raw content first for debugging
                print(f"DEBUG: Raw API Response: {response.text}")

                try:
                    response_data = response.json()
                except Exception as json_err:
                     print(f"CRITICAL: Failed to parse JSON from Voice API. Status: {response.status_code}. Raw: {response.text}")
                     await calls_collection.update_one(
                        {"_id": call_id},
                        {"$set": {"status": "Failed", "summary": f"API Error (Invalid JSON): {response.text[:100]}..."}}
                    )
                     raise HTTPException(status_code=500, detail=f"Voice API returned invalid JSON: {response.text[:50]}")

                if response.status_code not in [200, 201]:
                    # Mark optional failure
                    error_msg = response_data.get('detail') or response_data.get('message') or response_data.get('error') or response.text
                    
                    # Handle Rate Limits specifically
                    if "Rate limit exceeded" in str(error_msg) or response.status_code == 429:
                         await calls_collection.update_one(
                            {"_id": call_id},
                            {"$set": {"status": "Failed", "summary": "Failed: API Rate Limit Exceeded (Wait 1m)"}}
                        )
                         raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait 1 minute before starting another call.")

                    await calls_collection.update_one(
                        {"_id": call_id},
                        {"$set": {"status": "Failed", "summary": f"Failed to initiate: {error_msg}"}}
                    )
                    raise HTTPException(status_code=500, detail=f"Voice API Error: {error_msg}")
                
                # Get external ID
                external_id = response_data.get("data", {}).get("call_id")
                
                if not external_id:
                     await calls_collection.update_one(
                        {"_id": call_id},
                        {"$set": {"status": "Failed", "summary": "API returned success but no call_id found"}}
                    )
                     raise HTTPException(status_code=500, detail="Voice API did not return a call_id")

                # Update call with external ID
                await calls_collection.update_one(
                    {"_id": call_id},
                    {"$set": {"external_call_id": external_id}}
                )

                return {"message": "Call initiated successfully", "call_id": str(call_id), "external_id": external_id}

            except Exception as e:
                print(f"Error initiating call: {e}")
                # Clean up if call wasn't created properly
                raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
