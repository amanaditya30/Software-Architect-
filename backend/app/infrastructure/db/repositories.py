from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.domain.interfaces import (
    IUserRepository, IProjectRepository, IQuestionRepository, 
    IBlueprintRepository, IAgentLogRepository
)
from app.domain.models import (
    UserDomain, ProjectDomain, QuestionDomain, 
    ProjectBlueprintDomain, AgentLogDomain, ScoresDomain
)
from app.infrastructure.db.models_db import (
    UserDB, ProjectDB, QuestionDB, ProjectBlueprintDB, AgentLogDB
)

class UserRepository(IUserRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[UserDomain]:
        user_db = self.db.query(UserDB).filter(UserDB.id == user_id).first()
        return UserDomain.model_validate(user_db) if user_db else None

    def get_by_email(self, email: str) -> Optional[UserDomain]:
        user_db = self.db.query(UserDB).filter(UserDB.email == email).first()
        return UserDomain.model_validate(user_db) if user_db else None

    def create(self, email: str, fullname: str, hashed_password: str) -> UserDomain:
        user_db = UserDB(email=email, fullname=fullname, hashed_password=hashed_password)
        self.db.add(user_db)
        self.db.commit()
        self.db.refresh(user_db)
        return UserDomain.model_validate(user_db)

    def get_password_hash(self, email: str) -> Optional[str]:
        user_db = self.db.query(UserDB).filter(UserDB.email == email).first()
        return user_db.hashed_password if user_db else None

class ProjectRepository(IProjectRepository):
    def __init__(self, db: Session):
        self.db = db

    def _to_domain(self, project_db: ProjectDB) -> ProjectDomain:
        # Load questions, agent logs, and latest blueprint if available
        questions = [QuestionDomain.model_validate(q) for q in project_db.questions]
        agent_logs = [AgentLogDomain.model_validate(log) for log in project_db.agent_logs]
        
        latest_blueprint = None
        if project_db.blueprints:
            # Get latest by version or created_at
            latest = sorted(project_db.blueprints, key=lambda b: b.version, reverse=True)[0]
            latest_blueprint = ProjectBlueprintDomain.model_validate(latest)

        return ProjectDomain(
            id=project_db.id,
            user_id=project_db.user_id,
            name=project_db.name,
            description=project_db.description,
            status=project_db.status,
            created_at=project_db.created_at,
            updated_at=project_db.updated_at,
            questions=questions,
            latest_blueprint=latest_blueprint,
            agent_logs=agent_logs
        )

    def get_by_id(self, project_id: int) -> Optional[ProjectDomain]:
        project_db = self.db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        return self._to_domain(project_db) if project_db else None

    def get_all_by_user_id(self, user_id: int) -> List[ProjectDomain]:
        projects_db = self.db.query(ProjectDB).filter(ProjectDB.user_id == user_id).order_by(ProjectDB.updated_at.desc()).all()
        return [self._to_domain(p) for p in projects_db]

    def create(self, user_id: int, name: str, description: str) -> ProjectDomain:
        project_db = ProjectDB(user_id=user_id, name=name, description=description, status="draft")
        self.db.add(project_db)
        self.db.commit()
        self.db.refresh(project_db)
        return self._to_domain(project_db)

    def update_status(self, project_id: int, status: str) -> Optional[ProjectDomain]:
        project_db = self.db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        if project_db:
            project_db.status = status
            project_db.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(project_db)
            return self._to_domain(project_db)
        return None

    def delete(self, project_id: int) -> bool:
        project_db = self.db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        if project_db:
            self.db.delete(project_db)
            self.db.commit()
            return True
        return False

class QuestionRepository(IQuestionRepository):
    def __init__(self, db: Session):
        self.db = db

    def create_questions(self, project_id: int, questions: List[str]) -> List[QuestionDomain]:
        # First delete existing questions if any (for clean regenerate)
        self.db.query(QuestionDB).filter(QuestionDB.project_id == project_id).delete()
        
        q_dbs = []
        for text in questions:
            q_db = QuestionDB(project_id=project_id, question_text=text)
            self.db.add(q_db)
            q_dbs.append(q_db)
        self.db.commit()
        for q in q_dbs:
            self.db.refresh(q)
        return [QuestionDomain.model_validate(q) for q in q_dbs]

    def submit_answers(self, project_id: int, answers: Dict[int, str]) -> List[QuestionDomain]:
        questions_db = self.db.query(QuestionDB).filter(QuestionDB.project_id == project_id).all()
        for q in questions_db:
            if q.id in answers:
                q.answer_text = answers[q.id]
        self.db.commit()
        for q in questions_db:
            self.db.refresh(q)
        return [QuestionDomain.model_validate(q) for q in questions_db]

    def get_by_project_id(self, project_id: int) -> List[QuestionDomain]:
        questions_db = self.db.query(QuestionDB).filter(QuestionDB.project_id == project_id).all()
        return [QuestionDomain.model_validate(q) for q in questions_db]

class BlueprintRepository(IBlueprintRepository):
    def __init__(self, db: Session):
        self.db = db

    def create_blueprint(
        self, project_id: int, version: int, outputs: Dict[str, str], scores: Dict[str, int], diagrams: Dict[str, Any]
    ) -> ProjectBlueprintDomain:
        bp_db = ProjectBlueprintDB(
            project_id=project_id,
            version=version,
            outputs=outputs,
            scores=scores,
            diagrams=diagrams
        )
        self.db.add(bp_db)
        self.db.commit()
        self.db.refresh(bp_db)
        return ProjectBlueprintDomain.model_validate(bp_db)

    def get_latest_by_project_id(self, project_id: int) -> Optional[ProjectBlueprintDomain]:
        bp_db = self.db.query(ProjectBlueprintDB).filter(ProjectBlueprintDB.project_id == project_id).order_by(ProjectBlueprintDB.version.desc()).first()
        return ProjectBlueprintDomain.model_validate(bp_db) if bp_db else None

    def get_all_by_project_id(self, project_id: int) -> List[ProjectBlueprintDomain]:
        bps_db = self.db.query(ProjectBlueprintDB).filter(ProjectBlueprintDB.project_id == project_id).order_by(ProjectBlueprintDB.version.desc()).all()
        return [ProjectBlueprintDomain.model_validate(bp) for bp in bps_db]

class AgentLogRepository(IAgentLogRepository):
    def __init__(self, db: Session):
        self.db = db

    def create_log(self, project_id: int, sender: str, receiver: str, message: str, status: str) -> AgentLogDomain:
        log_db = AgentLogDB(
            project_id=project_id,
            sender=sender,
            receiver=receiver,
            message=message,
            status=status
        )
        self.db.add(log_db)
        self.db.commit()
        self.db.refresh(log_db)
        return AgentLogDomain.model_validate(log_db)

    def get_by_project_id(self, project_id: int) -> List[AgentLogDomain]:
        logs_db = self.db.query(AgentLogDB).filter(AgentLogDB.project_id == project_id).order_by(AgentLogDB.created_at.asc()).all()
        return [AgentLogDomain.model_validate(log) for log in logs_db]

    def clear_logs(self, project_id: int) -> None:
        self.db.query(AgentLogDB).filter(AgentLogDB.project_id == project_id).delete()
        self.db.commit()
