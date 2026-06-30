from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.infrastructure.db.database import SessionLocal
from app.infrastructure.db.repositories import AgentLogRepository, ProjectRepository
from app.infrastructure.security.auth_handler import decode_access_token
import asyncio
import json

router = APIRouter(prefix="/projects", tags=["WebSockets"])

@router.websocket("/{id}/stream")
async def stream_project_generation(websocket: WebSocket, id: int, token: str = None):
    # Accept connection
    await websocket.accept()
    
    # Optional auth validation if token provided
    if token:
        email = decode_access_token(token)
        if not email:
            await websocket.send_text(json.dumps({"error": "Unauthorized token"}))
            await websocket.close()
            return

    db: Session = SessionLocal()
    log_repo = AgentLogRepository(db)
    project_repo = ProjectRepository(db)
    
    sent_logs_ids = set()
    
    try:
        while True:
            # Re-fetch project to check status
            project = project_repo.get_by_id(id)
            if not project:
                await websocket.send_text(json.dumps({"error": "Project not found"}))
                break
                
            # Get latest logs
            logs = log_repo.get_by_project_id(id)
            new_logs = [l for l in logs if l.id not in sent_logs_ids]
            
            # Send new logs
            for log in new_logs:
                await websocket.send_text(json.dumps({
                    "type": "log",
                    "data": {
                        "id": log.id,
                        "sender": log.sender,
                        "receiver": log.receiver,
                        "message": log.message,
                        "status": log.status,
                        "created_at": log.created_at.isoformat()
                    }
                }))
                sent_logs_ids.add(log.id)
            
            # Send current status
            await websocket.send_text(json.dumps({
                "type": "status",
                "status": project.status
            }))
            
            # If done or idle, we check every 2 seconds; if actively generating, check every 500ms
            if project.status == "completed" and not new_logs:
                # Give a short buffer then finish
                await asyncio.sleep(1.0)
                await websocket.send_text(json.dumps({"type": "finished"}))
                break
            elif project.status not in ["generating"]:
                # If it's not generating and we sent all logs, we can idle or stop
                # Let's keep it open or close after some time. Let's just wait a bit.
                await asyncio.sleep(2.0)
            else:
                await asyncio.sleep(0.5)
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_text(json.dumps({"error": str(e)}))
        except:
            pass
    finally:
        db.close()
