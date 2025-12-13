import os
import json
from pypdf import PdfReader
from io import BytesIO
from groq import Groq

# Initialize Groq client
# Ensure GROQ_API_KEY is set in environment variables
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extracts text from a PDF file content.
    """
    try:
        reader = PdfReader(BytesIO(file_content))
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""

def parse_resume_with_llm(resume_text: str) -> dict:
    """
    Sends resume text to Groq API to extract structured candidate data.
    """
    prompt = f"""
    You are an AI assistant designed to extract structured information from resumes.
    
    Extract the following details from the resume text below:
    - fullName (string)
    - email (string)
    - phone (string)
    - experience (list of objects with 'role', 'company', 'duration', 'description')
    - exp_type (string: 'Fresher' or 'Experienced')
    - years_of_experience (integer, 0 if fresher)
    - skills (list of strings)
    - company_experience (list of strings - company names)
    
    Return ONLY a valid JSON object. Do not include markdown formatting like ```json ... ```.

    Resume Text:
    {resume_text[:10000]}  # Truncate to avoid token limits if necessary
    """

    try:
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="openai/gpt-oss-120b", # Using a fast OSS model available on Groq
            temperature=0.1,
            response_format={"type": "json_object"},
        )

        response_content = completion.choices[0].message.content
        parsed_data = json.loads(response_content)
        return parsed_data
    except Exception as e:
        print(f"Error parsing resume with LLM: {e}")
        return {}
