from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict
from app.infrastructure.db.database import get_db
from app.interfaces.api.auth import get_current_user_dependency
from app.interfaces.schemas.project import ProjectCreate, ProjectResponse, AnswersSubmit, BlueprintResponse
from app.use_cases.project import ProjectUseCase
from app.domain.models import UserDomain

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("", response_model=ProjectResponse)
def create_project(
    project_in: ProjectCreate,
    current_user: UserDomain = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    project_use_case = ProjectUseCase(db)
    return project_use_case.create_project(current_user.id, project_in.name, project_in.description)

@router.get("", response_model=List[ProjectResponse])
def get_projects(
    current_user: UserDomain = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    project_use_case = ProjectUseCase(db)
    return project_use_case.get_projects(current_user.id)

@router.get("/{id}", response_model=ProjectResponse)
def get_project(
    id: int,
    current_user: UserDomain = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    project_use_case = ProjectUseCase(db)
    project = project_use_case.get_project(id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return project

@router.post("/{id}/answers", response_model=ProjectResponse)
def submit_answers(
    id: int,
    answers_in: AnswersSubmit,
    current_user: UserDomain = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    project_use_case = ProjectUseCase(db)
    project = project_use_case.get_project(id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return project_use_case.submit_answers(id, answers_in.answers)

@router.post("/{id}/generate")
def generate_blueprint(
    id: int,
    background_tasks: BackgroundTasks,
    current_user: UserDomain = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    project_use_case = ProjectUseCase(db)
    project = project_use_case.get_project(id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return project_use_case.start_generation(id, background_tasks)

@router.get("/{id}/blueprints/latest", response_model=BlueprintResponse)
def get_latest_blueprint(
    id: int,
    current_user: UserDomain = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    project_use_case = ProjectUseCase(db)
    project = project_use_case.get_project(id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    bp = project_use_case.get_latest_blueprint(id)
    if not bp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No blueprints generated yet")
    return bp

@router.get("/{id}/blueprints", response_model=List[BlueprintResponse])
def get_blueprints(
    id: int,
    current_user: UserDomain = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    project_use_case = ProjectUseCase(db)
    project = project_use_case.get_project(id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return project_use_case.get_blueprints(id)

@router.delete("/{id}")
def delete_project(
    id: int,
    current_user: UserDomain = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    project_use_case = ProjectUseCase(db)
    project = project_use_case.get_project(id)
    if project.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    success = project_use_case.delete_project(id)
    return {"success": success}
