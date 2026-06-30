# Blueprint AI — Design software before writing code

Blueprint AI is a production-ready, AI-powered Software Architecture platform that helps developers transform ideas into engineering blueprints. Using a multi-agent system powered by **LangGraph** (with fallback simulation templates), it models a software consulting firm where 9 specialized AI agents (Product Manager, Business Analyst, Software Architect, Database Architect, Backend Engineer, Frontend Engineer, Security Architect, DevOps Engineer, QA Engineer) collaborate, debate, and verify each other's constraints to compile a robust set of 20 blueprint chapters.

---

## 🌟 Features

- **Agent Control Room**: Visual control panel showing live agent conversations, request logs, objections, approvals, and connections.
- **Interactive Diagrams**: 
  - Interactive **System Architecture Diagram** rendered via Mermaid.js.
  - Interactive **Database Schema ERD** rendered via React Flow (pan/zoom support, custom database node layout).
- **API Explorer**: Collapsible visual list of endpoints, HTTP verbs, payload shapes, and descriptions.
- **Folder Structure Tree**: Nested tree layout of files and folder structures following Clean Architecture.
- **Sprint Planner**: Kanban board categorizing scrum tasks and sprints.
- **Cost Dashboard**: Cost metrics and graphs outlining AWS cloud billing projections and optimization techniques.
- **Risk Assessment**: Detailed risk assessment grids.
- **Blueprint Exporter**: Copy markdown files and print clean layouts.

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** (Python 3.13)
- **LangGraph** & **LangChain** (Agent orchestration)
- **SQLAlchemy** with **SQLite** (Relational metadata storage)
- **Bcrypt** & **PyJWT** (Security identity handlers)
- **Uvicorn** (ASGI web runner)

### Frontend
- **Vite React** + **TypeScript**
- **Tailwind CSS v4** (Styling)
- **React Flow** (ERD engine)
- **Mermaid.js** (Architecture chart engine)
- **Axios** (API requests client)

---

## 🚀 Quick Start

### 1. Run Backend Server
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*Note: If you have a `GROQ_API_KEY`, add it to a `.env` file in the `backend` folder. If no key is set, the system automatically falls back to an **offline simulation mode** using rich pre-compiled templates.*

### 2. Run Frontend Server
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 🐳 Docker Deployment

To launch both the frontend and backend services inside containers using docker-compose:
```bash
docker-compose up --build
```
- Frontend will be available at `http://localhost:5173/`
- Backend will be available at `http://localhost:8000/`
