import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from bson import ObjectId
from services.llm_service import generate_call_summary
from database import candidates_collection, jobs_collection
import httpx

load_dotenv()

MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.dinodial
calls_collection = database.get_collection("calls")

async def check_call_status():
    """
    Periodically checks the status of active calls.
    Polls external API for real calls, simulates for mock calls.
    """
    print("Starting background call status checker...")
    api_key = os.getenv("DINODIAL_PROXY_API_KEY")

    while True:
        try:
            # Find all calls that are 'In-Progress' - check them immediately and continuously
            cursor = calls_collection.find({
                "status": "In-Progress"
            })
            list_cursor = await cursor.to_list(length=10)
            print(f"Checking {len(list_cursor)} in-progress calls...")
            for call in list_cursor:
                call_id = call["_id"]
                candidate_id = call.get("candidate_id")
                start_time = call.get("start_time")
                external_call_id = call.get("external_call_id")
                print("Call: ", call)
                print("Call ID: ", call_id)
                print("Candidate ID: ", candidate_id)
                print("External Call ID: ", external_call_id)
                # Handle Real External Calls
                if external_call_id and not str(external_call_id).startswith("mock-"):
                    if not api_key:
                        print(f"Skipping check for {call_id}: No API Key")
                        continue

                    try:
                        async with httpx.AsyncClient() as client:
                            response = await client.get(
                                f"https://api-dinodial-proxy.cyces.co/api/proxy/call/detail/{external_call_id}/",
                                headers={"Authorization": f"Bearer {api_key}"},
                                timeout=10.0
                            )
                            response_json = response.json()
                            print("=" * 80)
                            print("📞 External Call Response:")
                            print(f"Full Response: {response_json}")
                            print("=" * 80)
                            
                            if response.status_code == 200:
                                data = response_json.get("data", {})
                                status = data.get("status")
                                
                                # Extract all call data
                                call_details = data.get("call_details", {})
                                summary_data = data.get("callSummaryData", {})
                                outcomes_data = data.get("callOutcomesData", {})
                                transcription_data = call_details.get("transcriptionData", {})
                                phase_history = call_details.get("phaseHistory", [])
                                
                                print(f"📊 Call status: {status}")
                                print(f"📋 Outcomes data keys: {list(outcomes_data.keys()) if outcomes_data else 'EMPTY'}")
                                print(f"📋 Summary data keys: {list(summary_data.keys()) if summary_data else 'EMPTY'}")
                                print(f"📋 Call details keys: {list(call_details.keys()) if call_details else 'EMPTY'}")
                                print(f"📋 Transcription entries: {len(transcription_data.get('entries', []))} entries")
                                
                                # Check if call is completed or ended
                                call_ended = False
                                end_reason = ""
                                
                                if status == "completed":
                                    call_ended = True
                                    end_reason = "completed"
                                elif phase_history:
                                    last_phase = phase_history[-1]
                                    last_reason = last_phase.get("metadata", {}).get("reason", "")
                                    if last_reason in ["connection_closed", "no_answer", "user_hangup", "error"]:
                                        call_ended = True
                                        end_reason = last_reason
                                
                                if call_ended:
                                    # Build comprehensive transcript - check multiple locations
                                    transcript_entries = (
                                        transcription_data.get("entries", []) or
                                        transcription_data.get("transcripts", []) or
                                        call_details.get("transcripts", [])
                                    )
                                    print(f"📝 Found {len(transcript_entries)} transcript entries")
                                    
                                    transcript_text = ""
                                    if transcript_entries:
                                        # Handle both formats: entries with role/text or simple text array
                                        formatted_entries = []
                                        for entry in transcript_entries:
                                            if isinstance(entry, dict):
                                                role = entry.get('role', 'unknown').upper()
                                                text = entry.get('text', '')
                                                if text:
                                                    formatted_entries.append(f"{role}: {text}")
                                            elif isinstance(entry, str):
                                                formatted_entries.append(entry)
                                        transcript_text = "\n\n".join(formatted_entries) if formatted_entries else "Call completed but transcript not available"
                                    else:
                                        transcript_text = "Call ended - transcript not available"
                                    
                                    # Extract outcome details - check multiple possible locations
                                    # Try outcomes_data first, then summary_data, then call_details
                                    summary_text = (
                                        outcomes_data.get("summary") or 
                                        summary_data.get("summary") or 
                                        call_details.get("summary", "")
                                    )
                                    
                                    # Generate fallback summary from transcript if no summary provided
                                    if not summary_text and transcript_text and transcript_text != "Call ended - transcript not available":
                                        summary_text = f"Voice screening call conducted. {transcript_text[:300]}... (Full conversation in transcript)"
                                    elif not summary_text:
                                        summary_text = f"Call ended with reason: {end_reason}. No detailed summary available."
                                    
                                    outcome = outcomes_data.get("outcome", "incomplete")
                                    match_score = outcomes_data.get("match_score") or outcomes_data.get("matchScore", "")
                                    availability = outcomes_data.get("availability", "")
                                    skills_assessment = outcomes_data.get("skills_assessment") or outcomes_data.get("skillsAssessment", "")
                                    current_ctc = outcomes_data.get("current_ctc") or outcomes_data.get("currentCtc", "")
                                    expected_ctc = outcomes_data.get("expected_ctc") or outcomes_data.get("expectedCtc", "")
                                    call_end_reason = outcomes_data.get("end_reason") or outcomes_data.get("endReason", end_reason)
                                    
                                    print(f"💡 Extracted: outcome={outcome}, match_score={match_score}, summary_length={len(summary_text)}")
                                    
                                    # Construct comprehensive summary - handle empty data gracefully
                                    if summary_text or skills_assessment or outcome != "incomplete":
                                        final_summary = f"""🎯 OUTCOME: {outcome.upper()}
📊 MATCH SCORE: {match_score.upper() if match_score else 'Not Assessed'}
📅 AVAILABILITY: {availability or 'Not mentioned'}
💰 CURRENT CTC: {current_ctc or 'Not disclosed'}
💵 EXPECTED CTC: {expected_ctc or 'Not discussed'}
🔚 CALL END: {call_end_reason}

📋 SKILLS ASSESSMENT:
{skills_assessment or 'Assessment not completed - call ended early'}

📝 DETAILED SUMMARY:
{summary_text or 'Summary not generated - call ended prematurely'}"""
                                    else:
                                        # Call ended too early - create basic summary from transcript
                                        final_summary = f"""⚠️ INCOMPLETE CALL
🔚 END REASON: {call_end_reason}

The call ended before AI screening could be completed.
Manual review required - check transcript below."""
                                    
                                    # Get recording URL - check multiple possible field names
                                    recording_url = (
                                        call_details.get("recordingUrl") or 
                                        call_details.get("recording_url") or
                                        call_details.get("recordingURL") or
                                        data.get("recording_url", "")
                                    )
                                    print(f"🎙️ Recording URL: {recording_url if recording_url else 'NOT FOUND'}")

                                    # Determine final status
                                    final_status = "Completed" if end_reason == "completed" else "Failed" if end_reason == "no_answer" else "Completed"

                                    await calls_collection.update_one(
                                        {"_id": call_id},
                                        {
                                            "$set": {
                                                "status": final_status,
                                                "end_time": datetime.utcnow(),
                                                "summary": final_summary,
                                                "transcript": transcript_text,
                                                "recording_url": recording_url,
                                                "outcome": outcome,
                                                "match_score": match_score,
                                                "availability": availability,
                                                "skills_assessment": skills_assessment,
                                                "current_ctc": current_ctc,
                                                "expected_ctc": expected_ctc,
                                                "end_reason": call_end_reason
                                            }
                                        }
                                    )
                                    print(f"✅ Updated call {call_id} to {final_status}. Reason: {end_reason}")
                                    
                                    # Update candidate status based on AI screening results
                                    if candidate_id:
                                        screening_status = "selected" if outcome == "shortlisted" and match_score in ["high", "medium"] else "rejected" if outcome == "rejected" else "screened"
                                        
                                        from bson import ObjectId
                                        await candidates_collection.update_one(
                                            {"_id": ObjectId(candidate_id)},
                                            {
                                                "$set": {
                                                    "screening_status": screening_status,
                                                    "last_call_outcome": outcome,
                                                    "last_match_score": match_score
                                                }
                                            }
                                        )
                                        print(f"✅ Updated candidate {candidate_id} status to: {screening_status}")

                    except Exception as e:
                        print(f"Error checking external call {external_call_id}: {e}")
                    
                    continue
        except Exception as e:
            print(f"Error in status checker: {e}")
            import traceback
            traceback.print_exc()
        
        # Wait for 5 seconds before next check (faster polling for quicker updates)
        await asyncio.sleep(5)

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(check_call_status())
