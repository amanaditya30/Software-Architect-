from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.infrastructure.db.database import Base

class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    fullname = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("ProjectDB", back_populates="user", cascade="all, delete-orphan")

class ProjectDB(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="draft")  # draft, interviewing, generating, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("UserDB", back_populates="projects")
    questions = relationship("QuestionDB", back_populates="project", cascade="all, delete-orphan")
    blueprints = relationship("ProjectBlueprintDB", back_populates="project", cascade="all, delete-orphan")
    agent_logs = relationship("AgentLogDB", back_populates="project", cascade="all, delete-orphan")

class QuestionDB(Base):
    __tablename__ = "project_questions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("ProjectDB", back_populates="questions")

class ProjectBlueprintDB(Base):
    __tablename__ = "project_blueprints"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, default=1, nullable=False)
    outputs = Column(JSON, nullable=False)  # Dictionary of doc_name -> md_content
    scores = Column(JSON, nullable=False)   # Dictionary of architectural scores
    diagrams = Column(JSON, nullable=False) # JSON for react flow/mermaid diagrams data
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("ProjectDB", back_populates="blueprints")

class AgentLogDB(Base):
    __tablename__ = "agent_logs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String, nullable=False)
    receiver = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="info")  # info, request_change, approved
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("ProjectDB", back_populates="agent_logs")
