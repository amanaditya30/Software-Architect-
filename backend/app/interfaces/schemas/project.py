from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class ProjectCreate(BaseModel):
    name: str
    description: str

class AnswersSubmit(BaseModel):
    answers: Dict[int, str]  # question_id -> answer_text

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    answer_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ScoresResponse(BaseModel):
    architecture: int
    maintainability: int
    scalability: int
    security: int

class BlueprintResponse(BaseModel):
    id: int
    project_id: int
    version: int
    outputs: Dict[str, str]
    scores: ScoresResponse
    diagrams: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class AgentLogResponse(BaseModel):
    id: int
    sender: str
    receiver: str
    message: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionResponse] = []
    latest_blueprint: Optional[BlueprintResponse] = None
    agent_logs: List[AgentLogResponse] = []

    class Config:
        from_attributes = True
