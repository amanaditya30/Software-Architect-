from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class UserDomain(BaseModel):
    id: int
    email: EmailStr
    fullname: str
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionDomain(BaseModel):
    id: int
    project_id: int
    question_text: str
    answer_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ScoresDomain(BaseModel):
    architecture: int
    maintainability: int
    scalability: int
    security: int

class ProjectBlueprintDomain(BaseModel):
    id: int
    project_id: int
    version: int
    outputs: Dict[str, str]  # Map of output_name -> markdown_content
    scores: ScoresDomain
    diagrams: Dict[str, Any]  # Diagrams data (React Flow, Mermaid, etc.)
    created_at: datetime

    class Config:
        from_attributes = True

class AgentLogDomain(BaseModel):
    id: int
    project_id: int
    sender: str
    receiver: str
    message: str
    status: str  # info, request_change, approved
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectDomain(BaseModel):
    id: int
    user_id: int
    name: str
    description: str
    status: str  # draft, interviewing, generating, completed
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionDomain] = []
    latest_blueprint: Optional[ProjectBlueprintDomain] = None
    agent_logs: List[AgentLogDomain] = []

    class Config:
        from_attributes = True
