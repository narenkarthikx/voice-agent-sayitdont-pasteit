from fastapi import APIRouter, Depends
from database import calls_collection, candidates_collection
from routes.auth import get_current_user

router = APIRouter()

@router.get("/stats", response_description="Get dashboard statistics")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    # Basic counts
    total_calls = await calls_collection.count_documents({})
    total_candidates = await candidates_collection.count_documents({})
    
    # PRE-SCREENING STATS (Phase 1 - before calls)
    pre_screened_proceed = await candidates_collection.count_documents({"pre_screen_status": "proceed"})
    pre_screened_reject = await candidates_collection.count_documents({"pre_screen_status": "reject"})
    avg_fit_score_cursor = candidates_collection.aggregate([
        {"$match": {"fit_score": {"$ne": None}}},
        {"$group": {"_id": None, "avg_score": {"$avg": "$fit_score"}}}
    ])
    avg_fit_score_result = await avg_fit_score_cursor.to_list(length=1)
    avg_fit_score = int(avg_fit_score_result[0]["avg_score"]) if avg_fit_score_result else 0
    
    # AI Voice Screening Stats (Phase 2)
    completed_calls = await calls_collection.count_documents({"status": "Completed"})
    in_progress_calls = await calls_collection.count_documents({"status": "In-Progress"})
    
    # Outcome-based stats (Phase 3)
    # Outcome-based stats (Phase 3) - Case insensitive
    shortlisted = await calls_collection.count_documents({"outcome": {"$regex": "^shortlisted$", "$options": "i"}})
    rejected = await calls_collection.count_documents({"outcome": {"$regex": "^rejected$", "$options": "i"}})
    on_hold = await calls_collection.count_documents({"outcome": {"$regex": "^on_hold|on-hold$", "$options": "i"}})
    
    # Match score stats - Case insensitive
    high_match = await calls_collection.count_documents({"match_score": {"$regex": "^high$", "$options": "i"}})
    medium_match = await calls_collection.count_documents({"match_score": {"$regex": "^medium$", "$options": "i"}})
    low_match = await calls_collection.count_documents({"match_score": {"$regex": "^low$", "$options": "i"}})
    
    # Recent top candidates (last 5 shortlisted with high match)
    recent_top_candidates = []
    cursor = calls_collection.find({
        "outcome": {"$regex": "^shortlisted$", "$options": "i"},
        "match_score": {"$in": ["high", "medium", "High", "Medium", "HIGH", "MEDIUM"]}
    }).sort("end_time", -1).limit(5)
    
    async for call in cursor:
        candidate = await candidates_collection.find_one({"_id": call.get("candidate_id")})
        if candidate:
            recent_top_candidates.append({
                "name": candidate.get("fullName"),
                "match_score": call.get("match_score"),
                "skills": candidate.get("skills", [])[:3],
                "call_date": call.get("end_time")
            })
    
    return {
        "total_calls": total_calls,
        "total_candidates": total_candidates,
        # Pre-screening stats
        "pre_screened_proceed": pre_screened_proceed,
        "pre_screened_reject": pre_screened_reject,
        "avg_fit_score": avg_fit_score,
        # Voice call stats
        "completed_calls": completed_calls,
        "in_progress_calls": in_progress_calls,
        "shortlisted": shortlisted,
        "rejected": rejected,
        "on_hold": on_hold,
        "high_match": high_match,
        "medium_match": medium_match,
        "low_match": low_match,
        "recent_top_candidates": recent_top_candidates
    }
