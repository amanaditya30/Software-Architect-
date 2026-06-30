from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.domain.models import UserDomain, ProjectDomain, QuestionDomain, ProjectBlueprintDomain, AgentLogDomain

class IUserRepository(ABC):
    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[UserDomain]:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[UserDomain]:
        pass

    @abstractmethod
    def create(self, email: str, fullname: str, hashed_password: str) -> UserDomain:
        pass

    @abstractmethod
    def get_password_hash(self, email: str) -> Optional[str]:
        pass

class IProjectRepository(ABC):
    @abstractmethod
    def get_by_id(self, project_id: int) -> Optional[ProjectDomain]:
        pass

    @abstractmethod
    def get_all_by_user_id(self, user_id: int) -> List[ProjectDomain]:
        pass

    @abstractmethod
    def create(self, user_id: int, name: str, description: str) -> ProjectDomain:
        pass

    @abstractmethod
    def update_status(self, project_id: int, status: str) -> Optional[ProjectDomain]:
        pass

    @abstractmethod
    def delete(self, project_id: int) -> bool:
        pass

class IQuestionRepository(ABC):
    @abstractmethod
    def create_questions(self, project_id: int, questions: List[str]) -> List[QuestionDomain]:
        pass

    @abstractmethod
    def submit_answers(self, project_id: int, answers: Dict[int, str]) -> List[QuestionDomain]:
        pass

    @abstractmethod
    def get_by_project_id(self, project_id: int) -> List[QuestionDomain]:
        pass

class IBlueprintRepository(ABC):
    @abstractmethod
    def create_blueprint(
        self, project_id: int, version: int, outputs: Dict[str, str], scores: Dict[str, int], diagrams: Dict[str, Any]
    ) -> ProjectBlueprintDomain:
        pass

    @abstractmethod
    def get_latest_by_project_id(self, project_id: int) -> Optional[ProjectBlueprintDomain]:
        pass

    @abstractmethod
    def get_all_by_project_id(self, project_id: int) -> List[ProjectBlueprintDomain]:
        pass

class IAgentLogRepository(ABC):
    @abstractmethod
    def create_log(self, project_id: int, sender: str, receiver: str, message: str, status: str) -> AgentLogDomain:
        pass

    @abstractmethod
    def get_by_project_id(self, project_id: int) -> List[AgentLogDomain]:
        pass

    @abstractmethod
    def clear_logs(self, project_id: int) -> None:
        pass
