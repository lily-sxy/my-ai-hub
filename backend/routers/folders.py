from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Folder
from schemas import FolderCreate, FolderOut
from typing import List

router = APIRouter(prefix="/folders", tags=["folders"])

@router.get("/", response_model=List[FolderOut])
def get_folders(db: Session = Depends(get_db)):
    return db.query(Folder).order_by(Folder.position).all()

@router.post("/", response_model=FolderOut)
def create_folder(body: FolderCreate, db: Session = Depends(get_db)):
    folder = Folder(name=body.name)
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder

@router.delete("/{folder_id}")
def delete_folder(folder_id: str, db: Session = Depends(get_db)):
    folder = db.query(Folder).filter(Folder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    db.delete(folder)
    db.commit()
    return {"ok": True}
