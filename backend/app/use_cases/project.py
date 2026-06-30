from sqlalchemy.orm import Session
from fastapi import HTTPException, status, BackgroundTasks
from typing import List, Dict, Any, Optional
from app.infrastructure.db.repositories import ProjectRepository, QuestionRepository, BlueprintRepository, AgentLogRepository
from app.infrastructure.llm.groq_client import groq_client
from app.use_cases.agent_workflow import AgentOrchestrator
from app.domain.models import ProjectDomain, QuestionDomain, ProjectBlueprintDomain, AgentLogDomain

class ProjectUseCase:
    def __init__(self, db: Session):
        self.db = db
        self.project_repo = ProjectRepository(db)
        self.question_repo = QuestionRepository(db)
        self.blueprint_repo = BlueprintRepository(db)
        self.log_repo = AgentLogRepository(db)
        self.orchestrator = AgentOrchestrator(
            project_repo=self.project_repo,
            blueprint_repo=self.blueprint_repo,
            log_repo=self.log_repo
        )

    def get_projects(self, user_id: int) -> List[ProjectDomain]:
        return self.project_repo.get_all_by_user_id(user_id)

    def get_project(self, project_id: int) -> Optional[ProjectDomain]:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found."
            )
        return project

    def create_project(self, user_id: int, name: str, description: str) -> ProjectDomain:
        # Create project in database
        project = self.project_repo.create(user_id, name, description)
        
        # Generate 5-7 follow-up questions
        questions = groq_client.generate_questions(description)
        
        # Save questions to project
        self.question_repo.create_questions(project.id, questions)
        
        # Update status to interviewing
        self.project_repo.update_status(project.id, "interviewing")
        
        # Re-fetch updated project
        return self.project_repo.get_by_id(project.id)

    def submit_answers(self, project_id: int, answers: Dict[int, str]) -> ProjectDomain:
        # Save answers
        self.question_repo.submit_answers(project_id, answers)
        
        # Set status to draft (ready for generation)
        self.project_repo.update_status(project_id, "draft")
        
        return self.project_repo.get_by_id(project_id)

    def start_generation(self, project_id: int, background_tasks: BackgroundTasks) -> Dict[str, str]:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
            
        if project.status == "generating":
            return {"status": "generating", "message": "Blueprint generation is already in progress."}

        # Clear logs
        self.log_repo.clear_logs(project_id)
        
        # Trigger execution in background task to avoid blocking HTTP connection
        background_tasks.add_task(self._run_orchestrator, project_id)
        
        return {"status": "started", "message": "Blueprint generation started successfully."}

    async def _run_orchestrator(self, project_id: int):
        try:
            await self.orchestrator.execute(project_id)
        except Exception as e:
            # Errors are logged inside the orchestrator execute
            pass

    def get_latest_blueprint(self, project_id: int) -> Optional[ProjectBlueprintDomain]:
        return self.blueprint_repo.get_latest_by_project_id(project_id)

    def get_blueprints(self, project_id: int) -> List[ProjectBlueprintDomain]:
        return self.blueprint_repo.get_all_by_project_id(project_id)

    def delete_project(self, project_id: int) -> bool:
        return self.project_repo.delete(project_id)
