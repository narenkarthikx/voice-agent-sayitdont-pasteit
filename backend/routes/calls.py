from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models import CallModel
from database import calls_collection
from routes.auth import get_current_user
from bson import ObjectId
import httpx
import os

router = APIRouter()

@router.get("/", response_description="List all calls", response_model=List[CallModel])
async def list_calls(current_user: dict = Depends(get_current_user)):
    calls = []
    cursor = calls_collection.find().sort("start_time", -1)
    async for document in cursor:
        calls.append(document)
    return calls

@router.get("/{id}", response_description="Get a single call", response_model=CallModel)
async def get_call(id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    
    call = await calls_collection.find_one({"_id": ObjectId(id)})
    if call:
        return call
    raise HTTPException(status_code=404, detail="Call not found")

@router.get("/{id}/recording", response_description="Get call recording URL")
async def get_call_recording(id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    
    call = await calls_collection.find_one({"_id": ObjectId(id)})
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    # First check if we already have the recording URL stored
    recording_url = call.get("recording_url")
    if recording_url:
        return {"recording_url": recording_url}
        
    external_call_id = call.get("external_call_id")
    if not external_call_id:
        raise HTTPException(status_code=404, detail="External call ID not found")

    api_key = os.getenv("DINODIAL_PROXY_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="API Key not configured")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api-dinodial-proxy.cyces.co/api/proxy/recording-url/{external_call_id}/",
                headers={"Authorization": f"Bearer {api_key}"},
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                recording_url = data.get("data", {}).get("recording_url")
                
                # Store the recording URL for future requests
                if recording_url:
                    await calls_collection.update_one(
                        {"_id": ObjectId(id)},
                        {"$set": {"recording_url": recording_url}}
                    )
                
                return {"recording_url": recording_url}
            elif response.status_code == 400:
                # Call recording not available or expired
                return {"recording_url": None, "message": "Recording not available"}
            else:
                 raise HTTPException(status_code=response.status_code, detail="Failed to fetch recording from external provider")
    except httpx.HTTPStatusError as e:
        print(f"HTTP error fetching recording: {e}")
        return {"recording_url": None, "message": "Recording not available"}
    except Exception as e:
        print(f"Error fetching recording: {e}")
        raise HTTPException(status_code=500, detail=str(e))
