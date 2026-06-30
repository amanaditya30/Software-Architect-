import json
import logging
from typing import Dict, Any, List, Callable
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.config import settings
from app.infrastructure.llm.simulation import get_simulated_questions, generate_simulated_blueprint

logger = logging.getLogger(__name__)

class GroqClient:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.enabled = bool(self.api_key)
        
        if self.enabled:
            try:
                self.llm = ChatGroq(
                    temperature=0.2,
                    model_name=self.model,
                    groq_api_key=self.api_key
                )
            except Exception as e:
                logger.error(f"Failed to initialize Groq LLM client: {e}. Falling back to simulation.")
                self.enabled = False

    def generate_questions(self, description: str) -> List[str]:
        if not self.enabled:
            return get_simulated_questions(description)
            
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are a Principal Product Manager. Given a software idea, generate 6 intelligent, targeted follow-up questions to help architect the project. Return ONLY a valid JSON list of strings. No markdown, no wrappers, just a pure JSON array."),
                ("human", "Software Idea: {description}")
            ])
            chain = prompt | self.llm
            response = chain.invoke({"description": description})
            
            # Clean response text
            text = response.content.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
                
            return json.loads(text)
        except Exception as e:
            logger.error(f"Error generating questions with Groq: {e}. Falling back to simulation.")
            return get_simulated_questions(description)

    def generate_blueprint_section(self, section_name: str, project_context: str, previous_sections: Dict[str, str], agent_role: str) -> str:
        """Helper to generate a specific section using the Groq LLM with context."""
        if not self.enabled:
            return ""
            
        try:
            prompt_text = f"""You are the {agent_role}.
Your task is to generate the '{section_name}' documentation for the following project.

PROJECT DETAILS:
{project_context}

PREVIOUSLY COMPLETED SECTIONS:
{json.dumps(previous_sections, indent=2)}

Please write a highly detailed, professional, and production-ready section in Markdown.
Always explain WHY decisions are made and describe alternative solutions with trade-offs.
Do NOT use placeholders or TODOs. Make it complete.
"""
            prompt = ChatPromptTemplate.from_messages([
                ("system", f"You are a member of a software consulting firm working as a {agent_role}."),
                ("human", prompt_text)
            ])
            chain = prompt | self.llm
            response = chain.invoke({})
            return response.content.strip()
        except Exception as e:
            logger.error(f"Error generating section {section_name} with Groq: {e}")
            return ""
groq_client = GroqClient()
