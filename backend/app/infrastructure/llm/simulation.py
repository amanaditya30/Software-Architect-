import json
from typing import Dict, Any, List

def get_simulated_questions(description: str) -> List[str]:
    desc_lower = description.lower()
    
    # Check for keywords
    if "food" in desc_lower or "delivery" in desc_lower or "restaurant" in desc_lower:
        return [
            "Who are your primary user roles (e.g., Customers, Drivers, Restaurants, Admins)?",
            "What is the expected order volume and peak hour traffic concurrency?",
            "What is your target budget for infrastructure and hosting in the first year?",
            "Which cloud provider do you prefer (AWS, Google Cloud, Azure)?",
            "What authentication methods are required (Social logins, OTP/SMS, standard Email/Password)?",
            "Which payment gateway is preferred (Stripe, PayPal, Adyen, Razorpay)?",
            "How do you plan to handle real-time notifications (Push notifications, SMS, WebSockets for order tracking)?"
        ]
    elif "ride" in desc_lower or "uber" in desc_lower or "taxi" in desc_lower or "map" in desc_lower:
        return [
            "What is the targeted geographical coverage (single city, national, global)?",
            "How should driver-rider matching be optimized (nearest driver, rating-based, surge pricing)?",
            "Do you require real-time tracking of drivers using GPS coordinates (WebSockets/Kafka)?",
            "What cloud provider and maps API is preferred (Google Maps, Mapbox, OpenStreetMap)?",
            "What is the expected passenger/driver active ratio during peak hours?",
            "What payment gateways and split-payout options (e.g., Stripe Connect) are needed?",
            "Are there regulatory compliance requirements for user background checks or telemetry logs?"
        ]
    elif "commerce" in desc_lower or "store" in desc_lower or "shop" in desc_lower or "marketplace" in desc_lower:
        return [
            "Will this be a single-merchant store or a multi-vendor marketplace?",
            "How many catalog items and concurrent transactions do you expect at peak (e.g. Black Friday)?",
            "What search requirements do you have (e.g. autocomplete, filters, fuzzy matching via Elasticsearch/Algolia)?",
            "What inventory synchronization mechanism should be used across multiple warehouses?",
            "What payment methods and currency conversions must be supported?",
            "Do you need integration with external ERPs or shipping APIs (FedEx, UPS, DHL)?",
            "Should there be an affiliate, promo code, or customer loyalty rewards system?"
        ]
    elif "chat" in desc_lower or "social" in desc_lower or "messenger" in desc_lower or "network" in desc_lower:
        return [
            "What formats of communication are supported (Text, Images, Voice notes, Video calls)?",
            "Should messages be end-to-end encrypted (E2EE), or stored securely in database?",
            "Do you require features like typing indicators, read receipts, and online status (presence)?",
            "What moderation features are needed (Auto-flagging, block/report, admin dashboards)?",
            "What is the expected message volume per second?",
            "Should we design for group chats, and if so, what is the maximum group size?",
            "Is user media stored in CDN-optimized buckets with temporary access URLs?"
        ]
    else:
        # Generic premium software questions
        return [
            "Who are your primary users, and what are their access control levels (RBAC)?",
            "What is the estimated monthly/daily active user base, and what is peak concurrency?",
            "What is your target budget for hosting, and do you have a preferred cloud provider (AWS/GCP)?",
            "What authentication methods (JWT, OAuth2, SSO, MFA) are required?",
            "Does the application need to support mobile apps, web apps, or both?",
            "Are there any specific third-party integrations (payments, CRM, email servers) needed?",
            "What are the critical security and compliance guidelines (e.g., GDPR, HIPAA, PCI-DSS)?"
        ]

def generate_simulated_blueprint(name: str, description: str, answers: Dict[str, str]) -> Dict[str, Any]:
    # Parse answers or provide sensible defaults
    answers_str = "\n".join([f"- **Q**: {q}\n  **A**: {a}" for q, a in answers.items()])
    
    # We will generate a structured dictionary containing all 20 outputs
    outputs = {}
    
    # 1. Executive Summary
    outputs["Executive Summary"] = f"""# Executive Summary: {name}

## Project Overview
This document outlines the architectural blueprint and operational roadmap for **{name}**, designed to solve: *"{description}"*.

Based on stakeholders inputs:
{answers_str}

## Strategic Objective
The system is designed as a high-performance, containerized, and highly-scalable microservices (or modular monolith, depending on scale) architecture. By leveraging modern cloud patterns, this document ensures the project can go from concept to a production-ready system with clear cost projections, security structures, database designs, and development schedules.

## Core Architectural Pillars
1. **Security-First Design**: Zero-trust API architecture, JWT/OAuth2 authentication, strict RBAC, and TLS-everywhere.
2. **High Scalability & Resiliency**: Stateless compute layer, horizontal scaling (HPA), multi-level caching (Redis), and message queue buffers (Celery/RabbitMQ).
3. **Optimized Operations**: Containerization with Docker, automatic CI/CD pipelines, structured observability (Prometheus/Grafana), and clean architectural directory splits.
"""

    # 2. Functional Requirements
    outputs["Functional Requirements"] = f"""# Functional Requirements

## Core Features
1. **User Authentication & Identity Management**:
   - Secure signup, login, and password recovery.
   - Support for multiple roles (Administrators, general users, and custom roles).
2. **Core Workflow Engine**:
   - Ability to initiate workflows representing: *{description}*.
   - Live status tracking, database state transitions, and audit logs.
3. **Reporting & Analytics Dashboard**:
   - Real-time display of performance metrics, transactions, or user activity.
   - Interactive SVG/Canvas charts and summary views.
4. **Third-Party API Integrations**:
   - Integrated notification delivery (Email, SMS, WebSockets).
   - Secure payment processing or file storage pipelines.

## Detailed Requirements Matrix
| ID | Requirement | Actor | Priority | Complexity | Description |
|---|---|---|---|---|---|
| FR-01 | Secure Registration & Login | User | High | Low | Users can register via standard methods and obtain an access token. |
| FR-02 | Role-Based Access Control | System | High | Medium | Enforces permissions on endpoints based on user roles. |
| FR-03 | Workflow Creation | User | High | Medium | Initiate system workflows corresponding to the core business logic. |
| FR-04 | Real-time Status Stream | User | Medium | High | Live updates of processing items via WebSockets. |
| FR-05 | Analytics Dashboard | Admin | Medium | Medium | Aggregate usage data, transaction logs, and operational trends. |
"""

    # 3. Non Functional Requirements
    outputs["Non Functional Requirements"] = """# Non Functional Requirements

## Performance & Latency
- **API Response Time**: 95% of read requests must return in < 150ms. Write requests must return in < 300ms.
- **WebSocket Connection**: Real-time push updates must propagate with < 500ms latency.
- **Cache Hit Ratio**: Redis query caches must achieve > 80% hit ratio for static dashboard data.

## Scalability & Availability
- **Uptime SLA**: 99.9% annual availability (equivalent to less than 8.76 hours of downtime per year).
- **Concurrency**: Compute layer must scale out to handle 10,000+ concurrent requests.
- **Auto-Scaling**: Kubernetes Horizontal Pod Autoscaler (HPA) must scale replicas from 2 to 10 when CPU utilization exceeds 70%.

## Reliability & Fault Tolerance
- **RPO (Recovery Point Objective)**: Database backups must occur hourly. Maximum acceptable data loss is 1 hour.
- **RTO (Recovery Time Objective)**: Full system recovery from catastrophic region failure must take < 4 hours.
- **Graceful Degradation**: If third-party SMS or Email services fail, messages must queue in Redis and retry, preventing API blockage.

## Security & Compliance
- **Data Encryption**: All data encrypted in transit using TLS 1.3 and at rest using AES-256.
- **OWASP Compliance**: Protections against SQL injection, XSS, CSRF, and broken access controls.
- **Token Handling**: Short-lived JWTs (15 mins) combined with secure, HTTP-only refresh tokens (7 days).
"""

    # 4. User Stories
    outputs["User Stories"] = """# User Stories

## Epic 1: User Onboarding & Profiles
- **US-1.1 (Register)**: *As a new visitor, I want to sign up with my email and password so that I can create a secure account.*
  - **Acceptance Criteria**:
    - Email validation checks for correct structure.
    - Password must be at least 8 characters with 1 capital and 1 number.
    - Hashed passwords stored in DB using bcrypt.
- **US-1.2 (Log in)**: *As a registered user, I want to log in using my credentials so that I can access my workspace.*
  - **Acceptance Criteria**:
    - Returns a valid, signed JWT access token.
    - Captures last login timestamp.
    - Account locked for 15 minutes after 5 consecutive failed attempts.

## Epic 2: Core Platform Actions
- **US-2.1 (Initiate Action)**: *As a user, I want to create a new entry and fill in details so that I can start a project.*
  - **Acceptance Criteria**:
    - Form checks for required fields.
    - Triggers backend event validation.
    - Saves immediately to the database as a draft.
- **US-2.2 (Live Stream)**: *As a user, I want to watch the workflow execute live so that I know what step is currently running.*
  - **Acceptance Criteria**:
    - Establishes a WebSocket connection.
    - Receives structured JSON logs with colors and status.
    - Gracefully disconnects when the task completes.
"""

    # 5. Personas
    outputs["Personas"] = """# User Personas

## Persona 1: Sarah Jenkins - The Operations Manager
- **Demographics**: 34 years old, based in San Francisco, CA.
- **Tech-Savviness**: Moderate. Comfortable with web dashboards, Trello, and Salesforce.
- **Goals**: Wants to oversee workflow operations, check completion speeds, and quickly audit team activities.
- **Frustrations**: Confusing UIs with too many steps, laggy data loading, and lack of real-time statuses.
- **Value Proposition**: Blueprint AI's instant dashboard and real-time status feeds keep her updated on operations without page reloads.

## Persona 2: David Chen - The Technical Architect
- **Demographics**: 41 years old, remote (Chicago).
- **Tech-Savviness**: Advanced. Writes code, manages cloud infrastructure, and configures APIs.
- **Goals**: Wants to verify system security compliance, evaluate API schema integrations, and download clean database designs.
- **Frustrations**: Poorly documented APIs, missing foreign key constraints, lack of clear docker-compose files.
- **Value Proposition**: Detailed markdown exports, structural schema listings, and visual React Flow diagrams give David everything he needs to validate system structures instantly.
"""

    # 6. Business Rules
    outputs["Business Rules"] = """# Business Rules

## Authentication & Authorization
- **Rule BR-101 (Role Exclusivity)**: Only users with the `Admin` role can access the billing and tenant configuration APIs.
- **Rule BR-102 (Token Expiration)**: Any active session token will automatically expire after 24 hours, requiring re-authentication.

## System Workflow Transitions
- **Rule BR-201 (State Progression)**: A project cannot transition from `interviewing` to `generating` unless all required questionnaire fields have been completed.
- **Rule BR-202 (Concurrency Limit)**: A single tenant account cannot run more than 3 simultaneous LangGraph generations to prevent LLM rate-limit locks.

## Financial & Licensing Controls
- **Rule BR-301 (Free Tier Limits)**: Free tier users can create a maximum of 2 projects and are limited to basic PDF downloads.
- **Rule BR-302 (Refund Window)**: Pro subscriptions can request refunds within 14 days, subject to having generated less than 5 full blueprints.
"""

    # 7. Architecture Recommendation
    outputs["Architecture Recommendation"] = """# Architecture Recommendation

## Architectural Style: Modular Monolith vs. Microservices
We recommend starting with a **Modular Monolith** architecture that is structurally decoupled to support migration to **Microservices** in the future.

```mermaid
graph TD
    Client[Web/Mobile Frontend] -->|HTTPS / WSS| Gateway[FastAPI API Gateway / Router]
    Gateway -->|Auth Check| Security[Security Service]
    Gateway -->|Projects Logic| ProjectService[Project Service]
    Gateway -->|Agent Execution| WorkflowEngine[LangGraph Engine]
    
    WorkflowEngine -->|Queue Job| Redis[Redis Broker]
    Redis -->|Execute Async| Celery[Celery Worker Cluster]
    
    ProjectService -->|Read/Write| SQLite[(Primary Relational DB)]
    Celery -->|Store Output| SQLite
```

### Why this Decision was Made
- **Reduced Overhead**: Avoids complex service-to-service communication, distributed tracing, and networking delays associated with Kubernetes-based microservices in the initial phase.
- **Code Cleanliness**: The folder structure segregates domain boundaries. If the project grows, these modules can be extracted directly into standalone Dockerized microservices.
- **High Concurrency Protection**: By pushing LLM agent workloads into Celery workers and Redis, we ensure the FastAPI web server remains completely responsive under load.

### Alternative Approaches considered
1. **Fully Distributed Microservices (AWS Lambda + ECS)**
   - *Trade-off*: High operations complexity. Requires API Gateways, Service Discovery, and complex local developer setup. Deemed overkill for current SLA.
2. **Serverless (Next.js Edge Functions)**
   - *Trade-off*: Cold starts and execution time limits (e.g. Vercel 10s-30s limits) make long-running LangGraph multi-agent loops impossible.
"""

    # 8. Database Design
    outputs["Database Design"] = """# Database Design

The system implements a polyglot storage architecture to maximize performance and flexibility.

## Primary Relational Database Schema (SQL)
Used for structured metadata, user identity, billing, and transactional relationships.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_questions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Secondary Document Database Schema (MongoDB style)
Used for the dynamic generated blueprints and version histories, as the generated output contains nested components and variable formats.

### MongoDB Collection: `blueprints`
```json
{
  "_id": "ObjectId",
  "project_id": "Number",
  "version": "Number",
  "scores": {
    "architecture": "Number",
    "maintainability": "Number",
    "scalability": "Number",
    "security": "Number"
  },
  "outputs": {
    "executive_summary": "String (Markdown)",
    "functional_requirements": "String (Markdown)",
    "devops_plan": "String (Markdown)"
  },
  "diagrams": {
    "react_flow_nodes": "Array",
    "react_flow_edges": "Array"
  },
  "created_at": "ISODate"
}
```
"""

    # 9. REST API Design
    outputs["REST API Design"] = """# REST API Design

The API is structured around RESTful resources and formatted as JSON.

## Authentication Endpoints
- `POST /api/auth/register` - Create user.
- `POST /api/auth/login` - Login and return JWT.
- `GET /api/auth/me` - Authenticated profile.

## Project Endpoints
- `GET /api/projects` - List all projects.
- `POST /api/projects` - Start a new project skeleton.
- `GET /api/projects/{id}` - Fetch project detail.
- `POST /api/projects/{id}/answers` - Submit questionnaire.
- `POST /api/projects/{id}/generate` - Trigger the AI generation background task.

## Swagger Specification Sample (OpenAPI 3.0)
```json
{
  "paths": {
    "/api/projects/{id}/generate": {
      "post": {
        "summary": "Trigger architecture blueprint generation",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "202": {
            "description": "Generation accepted and started in background",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "project_id": { "type": "integer" },
                    "status": { "type": "string" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```
"""

    # 10. Folder Structure
    outputs["Folder Structure"] = """# Folder Structure

Below is the folder structure representing the separation of concerns, following Clean Architecture principles.

```
project-root/
├── backend/
│   ├── app/
│   │   ├── domain/               # Enterprise logic: pure data models and interfaces
│   │   │   ├── models.py
│   │   │   └── interfaces.py
│   │   ├── use_cases/            # Application logic: workflow scripts
│   │   │   ├── project.py
│   │   │   └── auth.py
│   │   ├── infrastructure/       # External drivers: DB engines, security, LLMs
│   │   │   ├── db/
│   │   │   │   └── repositories.py
│   │   │   ├── llm/
│   │   │   └── security/
│   │   └── interfaces/           # Web entry: FastAPI routes and validation schemas
│   │       ├── api/
│   │       │   └── projects.py
│   │       └── schemas/
│   ├── tests/
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── components/           # Reusable UI components
    │   ├── context/              # React Context (Auth, Project)
    │   ├── pages/                # Page route views
    │   └── services/             # Axios API connectors
    └── package.json
```
"""

    # 11. Security Architecture
    outputs["Security Architecture"] = """# Security Architecture

## Authentication Protocol
The system enforces authentication using **JSON Web Tokens (JWT)**.
- **Signing Key**: HMAC-SHA256 using a 256-bit cryptographically secure secret.
- **MFA (Multi-Factor Authentication)**: Recommended integration using TOTP (Time-based One Time Password) for Admin roles.

## Authorization & RBAC
Permissions are mapped directly to endpoints via FastAPI Dependency Injection.
- `ROLE_USER`: Can view own projects, submit answers, download plans.
- `ROLE_ADMIN`: Full access to database analytics, user bans, configurations.

## OWASP Security Controls
1. **Broken Object Level Authorization (BOLA)**: Endpoint filters ensure database rows are queried using `WHERE user_id = current_user.id`.
2. **Rate Limiting**: IP-based rate limiting on login routes (max 10 requests per minute) and standard APIs (max 100 requests per minute) implemented in Redis.
3. **Sensitive Data Storage**: Database passwords, LLM keys, and secret tokens are injected strictly via Environment variables. Hashed passwords use Bcrypt with a work factor of 12.
"""

    # 12. DevOps Plan
    outputs["DevOps Plan"] = """# DevOps Plan

## Containerization strategy
We use Docker to containerize all components.

### Docker Core Components
- **Web App Compute**: Multi-stage build Python 3.13 image.
- **Frontend Assets**: Vite compiled SPA served via Nginx.
- **Broker**: Redis Alpine container.
- **Workers**: Identical Python runtime running Celery worker command.

## Local Docker-Compose Environment
Allows engineers to run the entire stack locally with a single command.
- Maps volumes for local DB and configurations.
- Exposes port 8000 for FastAPI and port 5173 for React.
"""

    # 13. CI/CD Strategy
    outputs["CI/CD Strategy"] = """# CI/CD Strategy

We use **GitHub Actions** for continuous integration and delivery.

```mermaid
graph TD
    Push[Code Push to main/develop] --> Build[Run Linter & Build Images]
    Build --> Test[Run Pytest & Vite Unit Tests]
    Test --> DeployStaging[Push to AWS ECR & Update ECS Staging]
    DeployStaging --> SmokeTest[Run Automated Smoke Tests]
    SmokeTest --> Approval[Manual Release Approval]
    Approval --> DeployProduction[Deploy to Production ECS Cluster]
```

## GitHub Actions workflow (`.github/workflows/main.yml`)
1. **Linter & Code Quality**: Runs `black`, `flake8`, and `eslint`.
2. **Security Scan**: Runs `bandit` on Python code and `npm audit` on frontend.
3. **Testing**: Spin up ephemeral SQLite service and execute Pytest.
4. **Publishing**: Multi-arch docker builds pushed to GitHub Container Registry (GHCR) or AWS ECR.
"""

    # 14. Deployment Guide
    outputs["Deployment Guide"] = """# Deployment Guide

This guide details deployment to **AWS (Amazon Web Services)**.

## Cloud Infrastructure Services
- **Elastic Container Service (ECS)** on **AWS Fargate** (Serverless container runtime).
- **RDS PostgreSQL** for relational transactional data.
- **ElastiCache Redis** for fast queues, memory, and token cache.
- **S3 Bucket** + **CloudFront CDN** for hosting the compiled React static files.

## Step-by-Step CLI Setup
1. **Initialize Terraform Configuration**:
   ```bash
   cd terraform/
   terraform init
   terraform apply --auto-approve
   ```
2. **Push Containers to ECR**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login
   docker build -t blueprint-api ./backend
   docker tag blueprint-api:latest <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/blueprint-api:latest
   docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/blueprint-api:latest
   ```
3. **Trigger ECS Service Update**:
   ```bash
   aws ecs update-service --cluster blueprint-cluster --service api-service --force-new-deployment
   ```
"""

    # 15. Cost Estimation
    outputs["Cost Estimation"] = """# Cost Estimation (AWS Monthly Projections)

Based on a monthly scale of 100,000 active users and 10,000 blueprint generations.

## Infrastructure Breakdown
| Category | AWS Service | Detail / Config | Estimated Cost (USD) |
|---|---|---|---|
| Compute | AWS ECS Fargate | 2x vCPU, 4GB RAM Replicas | $120.00 |
| Database | AWS RDS PostgreSQL | db.t4g.medium (Multi-AZ) | $75.00 |
| Caching/Queue | ElastiCache Redis | cache.t4g.micro | $18.00 |
| Static Frontend | AWS S3 + CloudFront | 500GB outbound transfer | $45.00 |
| LLM API | Groq Cloud APIs | 10k generations x 200k tokens | $50.00 |
| Monitoring | AWS CloudWatch | Metrics, 30-day logs | $30.00 |
| **Total** | | | **$338.00** |

## Cost Optimization Strategies
- **Fargate Spot Instances**: Using Spot instances for Celery workers can save up to 70% of worker compute costs.
- **Cache Headers**: Set high caching expiry times on assets served via CloudFront to reduce bandwidth bills.
- **SQLite Dev Environments**: Avoid cloud instances for local developers; run SQLite and local Redis configurations.
"""

    # 16. Team Recommendation
    outputs["Team Recommendation"] = """# Team Recommendation

For building and launching the first release of Blueprint AI within 3 months, we recommend a lean, cross-functional engineering team.

## Recommended Roles
1. **1x Technical Lead / Architect**:
   - Focuses on LangGraph orchestration, DB structures, and API safety.
2. **1x Backend Engineer**:
   - Builds Python APIs, security tokens, Docker, and celery queues.
3. **1x Frontend Engineer**:
   - Focuses on React Flow UI, Mermaid adapters, dashboard screens.
4. **1x Product Owner / Quality Assurance**:
   - Gathers product workflows, edits requirements, writes integration tests.

## Skill Mapping
- **Languages**: Python (FastAPI), TypeScript (React).
- **Orchestration**: Docker, Docker-compose, ECS.
- **State Engines**: LangGraph, stateful graphs, queue networks.
"""

    # 17. Sprint Planning
    outputs["Sprint Planning"] = """# Sprint Planning

A 6-week timeline split into 3 Sprints.

## Sprint 1: Foundation & Auth (Weeks 1-2)
- **SP-101**: Setup project repositories, database schemas, and docker-compose.
- **SP-102**: Write auth endpoints (Register, Login, Me) and JWT validation middleware.
- **SP-103**: Implement frontend layout, routing, and registration interfaces.

## Sprint 2: AI Workflows & Diagram Engine (Weeks 3-4)
- **SP-201**: Define LangGraph state nodes, prompts, and Groq LLM connectors.
- **SP-202**: Setup Celery tasks to run graph analysis in the background.
- **SP-203**: Integrate React Flow for Database ERD visualization and layout rendering.

## Sprint 3: Dashboards & Exports (Weeks 5-6)
- **SP-301**: Implement Folder viewer, API inspector, Risk/Cost dashboards.
- **SP-302**: Create PDF exporter and markdown copy utils.
- **SP-303**: Run system tests, write deployment Terraform files, and launch.
"""

    # 18. Risk Analysis
    outputs["Risk Analysis"] = """# Risk Analysis

## Risk Matrix
- **R-01: LLM Rate-limiting / Timeout**
  - *Likelihood*: High | *Impact*: Medium
  - *Mitigation*: Implement Redis-based token buckets and a background worker queue (Celery) with automatic retries.
- **R-02: User Data Leaks in LLM Prompts**
  - *Likelihood*: Low | *Impact*: High
  - *Mitigation*: Strip personal identifiable information (PII) before sending descriptions to LLM APIs.
- **R-03: Performance Degrades under Concurrent Generations**
  - *Likelihood*: Medium | *Impact*: High
  - *Mitigation*: Limit concurrent generation slots per user using Redis counters and separate compute queues.
"""

    # 19. Technology Comparison
    outputs["Technology Comparison"] = """# Technology Comparison

## 1. Multi-Agent Engine: LangGraph vs. CrewAI
- **LangGraph**:
  - *Pros*: Built on top of LangChain, allows cyclic graphs (essential for agent debate/reviews), full control over state updates.
  - *Cons*: Slightly steeper learning curve.
- **CrewAI**:
  - *Pros*: Very easy to setup linear team flows.
  - *Cons*: Harder to customize precise review loops or circular state edits.
  - *Decision*: **LangGraph** due to advanced feedback requirements.

## 2. API Layer: FastAPI vs. Express (Node.js)
- **FastAPI**:
  - *Pros*: Dynamic Pydantic validation, native support for Python LangChain libraries, asynchronous endpoints.
  - *Cons*: Ecosystem smaller than Node.js.
- **Express**:
  - *Pros*: Massive NPM ecosystem.
  - *Cons*: Integration with Python AI packages requires running subprocesses.
  - *Decision*: **FastAPI** to keep AI logic and APIs in the same runtime.
"""

    # 20. Future Scalability Strategy
    outputs["Future Scalability Strategy"] = """# Future Scalability Strategy

As Blueprint AI grows from 10,000 to 1,000,000+ monthly blueprint generations, the following strategies should be implemented.

## 1. Database Read Replicas & CQRS
- Implement Command Query Responsibility Segregation (CQRS).
- Direct all analytical dashboard reads to PostgreSQL read-replicas, keeping the master database unburdened for write transactions.

## 2. Distributed Graph State Store
- Transition from local memory checkpoints in LangGraph to a distributed state manager using a highly-available Redis cluster.
- This allows any FastAPI instance in the Fargate cluster to handle or resume any running agent workflow.

## 3. Dedicated LLM Fine-Tuning
- Train or fine-tune open-source models (like Llama-3-70B or Mixtral) on high-quality technical documentations and API schema databases.
- Deploy these models on dedicated cloud GPU clusters (AWS SageMaker or RunPod) to lower token cost and latency compared to public SaaS APIs.
"""

    # Now let's build the interactive diagram and database data
    # Nodes and Edges for database
    diagram_nodes = [
        {"id": "1", "type": "dbNode", "position": {"x": 50, "y": 50}, "data": {"label": "Users Table", "fields": ["id: SERIAL (PK)", "email: VARCHAR", "fullname: VARCHAR", "password_hash: VARCHAR", "created_at: TIMESTAMP"]}},
        {"id": "2", "type": "dbNode", "position": {"x": 350, "y": 50}, "data": {"label": "Projects Table", "fields": ["id: SERIAL (PK)", "user_id: INT (FK)", "name: VARCHAR", "description: TEXT", "status: VARCHAR", "created_at: TIMESTAMP"]}},
        {"id": "3", "type": "dbNode", "position": {"x": 650, "y": 50}, "data": {"label": "Project Questions Table", "fields": ["id: SERIAL (PK)", "project_id: INT (FK)", "question_text: TEXT", "answer_text: TEXT"]}},
        {"id": "4", "type": "dbNode", "position": {"x": 350, "y": 300}, "data": {"label": "Blueprints Document", "fields": ["id: SERIAL (PK)", "project_id: INT (FK)", "version: INT", "outputs: JSON", "scores: JSON", "diagrams: JSON"]}},
        {"id": "5", "type": "dbNode", "position": {"x": 50, "y": 300}, "data": {"label": "Agent Logs Table", "fields": ["id: SERIAL (PK)", "project_id: INT (FK)", "sender: VARCHAR", "receiver: VARCHAR", "message: TEXT", "status: VARCHAR"]}},
    ]
    
    diagram_edges = [
        {"id": "e1-2", "source": "1", "target": "2", "animated": True, "label": "1 to many"},
        {"id": "e2-3", "source": "2", "target": "3", "animated": True, "label": "1 to many"},
        {"id": "e2-4", "source": "2", "target": "4", "animated": True, "label": "1 to many"},
        {"id": "e2-5", "source": "2", "target": "5", "animated": True, "label": "1 to many"},
    ]
    
    diagrams = {
        "db_nodes": diagram_nodes,
        "db_edges": diagram_edges,
        "architecture_mermaid": """graph TD
    Client[Web Browser] -->|HTTPS/WSS| API[FastAPI Server]
    API -->|Auth| DB[(PostgreSQL)]
    API -->|Run Task| Broker[Redis Broker]
    Broker -->|Orchestrate| Workers[Celery Worker Cluster]
    Workers -->|Debate API Call| LLM[Groq LLM API]
    Workers -->|Save Blueprint| DB""",
    }

    # Scores
    scores = {
        "architecture": 88,
        "maintainability": 92,
        "scalability": 85,
        "security": 90
    }
    
    return {
        "outputs": outputs,
        "scores": scores,
        "diagrams": diagrams
    }
