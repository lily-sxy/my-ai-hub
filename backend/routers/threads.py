from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import ChatChatThread
from schemas import ChatThreadCreate, ChatThreadUpdate, ChatThreadOut
from typing import List, Optional
from datetime import datetime, timezone

router = APIRouter(prefix="/threads", tags=["threads"])

@router.get("/", response_model=List[ChatThreadOut])
def get_threads(include_deleted: bool = False, db: Session = Depends(get_db)):
    q = db.query(ChatThread)
    if include_deleted:
        q = q.filter(ChatThread.deleted_at.isnot(None))
    else:
        q = q.filter(ChatThread.deleted_at.is_(None))
    return q.order_by(ChatThread.created_at.desc()).all()

@router.post("/", response_model=ChatThreadOut)
def create_thread(body: ChatThreadCreate, db: Session = Depends(get_db)):
    thread = ChatThread(**body.model_dump())
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread

@router.patch("/{thread_id}", response_model=ChatThreadOut)
def update_thread(thread_id: str, body: ChatThreadUpdate, db: Session = Depends(get_db)):
    thread = db.query(ChatThread).filter(ChatThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="ChatThread not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(thread, key, value)
    db.commit()
    db.refresh(thread)
    return thread

@router.delete("/{thread_id}")
def soft_delete_thread(thread_id: str, db: Session = Depends(get_db)):
    thread = db.query(ChatThread).filter(ChatThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="ChatThread not found")
    thread.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return {"ok": True}

@router.delete("/{thread_id}/permanent")
def hard_delete_thread(thread_id: str, db: Session = Depends(get_db)):
    thread = db.query(ChatThread).filter(ChatThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="ChatThread not found")
    db.delete(thread)
    db.commit()
    return {"ok": True}

@router.post("/{thread_id}/restore")
def restore_thread(thread_id: str, db: Session = Depends(get_db)):
    thread = db.query(ChatThread).filter(ChatThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="ChatThread not found")
    thread.deleted_at = None
    db.commit()
    return {"ok": True}
