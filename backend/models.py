from pydantic import BaseModel, EmailStr, Field, GetCoreSchemaHandler, GetJsonSchemaHandler, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from pydantic_core import CoreSchema, core_schema
from pydantic.json_schema import JsonSchemaValue

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: GetCoreSchemaHandler
    ) -> CoreSchema:
        return core_schema.union_schema(
            [
                core_schema.is_instance_schema(ObjectId),
                core_schema.no_info_plain_validator_function(cls.validate),
            ],
            serialization=core_schema.to_string_ser_schema(),
        )

    @classmethod
    def validate(cls, v: Any) -> ObjectId:
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(
        cls, core_schema: CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        json_schema = handler(core_schema)
        json_schema.update(type="string")
        return json_schema

class JobModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    title: str = Field(...)
    description: str = Field(...)
    requirements: List[str] = Field(default=[])
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="Open") # Open, Closed

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

class CandidateModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    job_id: Optional[str] = Field(None) # Link to a Job
    fullName: str = Field(...)
    email: EmailStr = Field(...)
    phone: str = Field(...)
    experience: List[Dict[str, Any]] = Field(default=[])
    exp_type: str = Field(...) # "Fresher" or "Experienced"
    years_of_experience: Optional[int] = Field(None)
    skills: List[str] = Field(default=[])
    company_experience: List[str] = Field(default=[])
    resume_text: str = Field(...)
    parsed_data: Dict[str, Any] = Field(default={})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Pre-screening fields (Phase 1 - before call)
    fit_score: Optional[int] = Field(None) # 0-100 score from LLM comparison
    pre_screen_status: Optional[str] = Field(None) # proceed, reject, pending
    pre_screen_reason: Optional[str] = Field(None) # Why proceed/reject
    matching_skills: List[str] = Field(default=[]) # Skills that match job
    missing_skills: List[str] = Field(default=[]) # Skills missing from job requirements
    
    # Post-call screening fields (Phase 3 - after call)
    screening_status: Optional[str] = Field(None) # not_screened, screened, selected, rejected
    last_call_outcome: Optional[str] = Field(None) # From AI call outcome
    last_match_score: Optional[str] = Field(None) # From AI call match_score

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "fullName": "John Doe",
                "email": "jdoe@example.com",
                "phone": "+1234567890",
                "exp_type": "Experienced",
                "years_of_experience": 5,
                "skills": ["Python", "React"],
                "company_experience": ["Tech Corp", "StartUp Inc"],
                "experience": [{"role": "Dev", "company": "Tech Corp"}],
                "resume_text": "...",
                "parsed_data": {}
            }
        }
    )

class CallModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    candidate_id: str = Field(...)
    status: str = Field(default="Pending") # Pending, In-Progress, Completed, Failed, NoAnswer
    start_time: Optional[datetime] = Field(None)
    end_time: Optional[datetime] = Field(None)
    summary: Optional[str] = Field(None)
    transcript: Optional[str] = Field(None)
    external_call_id: Optional[str] = Field(None)
    recording_url: Optional[str] = Field(None)
    outcome: Optional[str] = Field(None)
    match_score: Optional[str] = Field(None)
    availability: Optional[str] = Field(None)
    skills_assessment: Optional[str] = Field(None)
    current_ctc: Optional[str] = Field(None)
    expected_ctc: Optional[str] = Field(None)
    end_reason: Optional[str] = Field(None)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

class UserLogin(BaseModel):
    username: str
    password: str

class UserInDB(UserLogin):
    password_hash: str

