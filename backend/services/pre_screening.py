import os
import json
from groq import Groq

# Initialize Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def calculate_fit_score(resume_data: dict, job_details: dict) -> dict:
    """
    Uses LLM to compare resume with job requirements and calculate fit score.
    Returns: {
        "fit_score": 0-100,
        "decision": "proceed" | "reject",
        "reason": "explanation",
        "matching_skills": [],
        "missing_skills": []
    }
    """
    
    # Extract relevant data
    candidate_skills = resume_data.get("skills", [])
    candidate_experience = resume_data.get("experience", [])
    years_of_experience = resume_data.get("years_of_experience", 0)
    exp_type = resume_data.get("exp_type", "Fresher")
    
    job_title = job_details.get("title", "Unknown Position")
    job_requirements = job_details.get("requirements", [])
    job_description = job_details.get("description", "")
    
    prompt = f"""You are an expert technical recruiter. Analyze if this candidate is suitable for a phone screening call.

JOB DETAILS:
Title: {job_title}
Description: {job_description}
Required Skills: {', '.join(job_requirements)}

CANDIDATE PROFILE:
Experience Type: {exp_type}
Years of Experience: {years_of_experience}
Skills: {', '.join(candidate_skills)}
Work Experience: {json.dumps(candidate_experience, indent=2)}

TASK:
1. Calculate a fit_score (0-100) based on:
   - Skill match percentage (40% weight)
   - Experience relevance (30% weight)
   - Years of experience match (30% weight)

2. Decision rules:
   - fit_score >= 60: "proceed" (candidate deserves a call)
   - fit_score < 60: "reject" (not suitable, save voice credits)

3. Identify:
   - matching_skills: Which required skills the candidate has
   - missing_skills: Which required skills the candidate lacks

4. Provide a brief reason (1-2 sentences) explaining the decision

Return ONLY valid JSON with this structure:
{{
    "fit_score": <number 0-100>,
    "decision": "<proceed|reject>",
    "reason": "<explanation>",
    "matching_skills": [<list of matching skills>],
    "missing_skills": [<list of missing skills>]
}}
"""

    try:
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        
        response_content = completion.choices[0].message.content
        result = json.loads(response_content)
        
        # Validate response structure
        if "fit_score" not in result or "decision" not in result:
            raise ValueError("Invalid response structure from LLM")
        
        # Ensure fit_score is in valid range
        result["fit_score"] = max(0, min(100, int(result.get("fit_score", 0))))
        
        # Ensure decision is valid
        if result["decision"] not in ["proceed", "reject"]:
            result["decision"] = "proceed" if result["fit_score"] >= 60 else "reject"
        
        print(f"✅ Pre-screening completed: Score={result['fit_score']}, Decision={result['decision']}")
        return result
        
    except Exception as e:
        print(f"❌ Error in pre-screening: {e}")
        # Fallback: proceed with call if LLM fails
        return {
            "fit_score": 50,
            "decision": "proceed",
            "reason": "Unable to calculate fit score, proceeding with manual review",
            "matching_skills": [],
            "missing_skills": []
        }
