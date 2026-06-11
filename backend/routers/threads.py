from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Thread
from schemas import ThreadCreate, ThreadUpdate, ThreadOut
from typing import List, Optional
from datetime import datetime, timezone

router = APIRouter(prefix="/threads", tags=["threads"])

@router.get("/", response_model=List[ThreadOut])
def get_threads(include_deleted: bool = False, db: Session = Depends(get_db)):
    q = db.query(Thread)
    if include_deleted:
        q = q.filter(Thread.deleted_at.isnot(None))
    else:
        q = q.filter(Thread.deleted_at.is_(None))
    return q.order_by(Thread.created_at.desc()).all()

@router.post("/", response_model=ThreadOut)
def create_thread(body: ThreadCreate, db: Session = Depends(get_db)):
    thread = Thread(**body.model_dump())
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread

@router.patch("/{thread_id}", response_model=ThreadOut)
def update_thread(thread_id: str, body: ThreadUpdate, db: Session = Depends(get_db)):
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(thread, key, value)
    db.commit()
    db.refresh(thread)
    return thread

@router.delete("/{thread_id}")
def soft_delete_thread(thread_id: str, db: Session = Depends(get_db)):
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    thread.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return {"ok": True}

@router.delete("/{thread_id}/permanent")
def hard_delete_thread(thread_id: str, db: Session = Depends(get_db)):
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    db.delete(thread)
    db.commit()
    return {"ok": True}

@router.post("/{thread_id}/restore")
def restore_thread(thread_id: str, db: Session = Depends(get_db)):
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    thread.deleted_at = None
    db.commit()
    return {"ok": True}
