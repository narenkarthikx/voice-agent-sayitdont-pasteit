from groq import Groq
import os

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def generate_call_summary(transcript: str, job_description: str = "") -> str:
    """
    Generates a summary of the call based on the transcript using Groq API.
    """
    prompt = f"""
    You are an expert recruiter. Summarize the following interview transcript. 
    Highlight the candidate's strengths, weaknesses, and suitability for the role.
    
    Job Description Context: {job_description}

    Transcript:
    {transcript}
    
    Summary:
    """
    
    try:
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="openai/gpt-oss-120b",
            temperature=0.5,
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Error generating summary: {e}")
        return "Summary generation failed."
