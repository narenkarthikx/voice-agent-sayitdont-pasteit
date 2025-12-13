from fastapi import APIRouter, Body, HTTPException, status, Depends
from typing import List
from models import JobModel
from database import jobs_collection
from routes.auth import get_current_user
from bson import ObjectId

router = APIRouter()

@router.post("/", response_description="Create a new job", response_model=JobModel)
async def create_job(job: JobModel = Body(...), current_user: dict = Depends(get_current_user)):
    new_job = await jobs_collection.insert_one(job.model_dump(by_alias=True))
    created_job = await jobs_collection.find_one({"_id": new_job.inserted_id})
    return created_job

@router.get("/", response_description="List all jobs", response_model=List[JobModel])
async def list_jobs(current_user: dict = Depends(get_current_user)):
    jobs = []
    cursor = jobs_collection.find().sort("created_at", -1)
    async for document in cursor:
        jobs.append(document)
    return jobs

@router.get("/{id}", response_description="Get a single job", response_model=JobModel)
async def show_job(id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    
    job = await jobs_collection.find_one({"_id": ObjectId(id)})
    if job:
        return job
    raise HTTPException(status_code=404, detail="Job not found")

@router.delete("/{id}", response_description="Delete a job")
async def delete_job(id: str, current_user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    
    delete_result = await jobs_collection.delete_one({"_id": ObjectId(id)})
    if delete_result.deleted_count == 1:
        return {"message": "Job deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Job not found")
