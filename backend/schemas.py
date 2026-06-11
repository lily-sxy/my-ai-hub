from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FolderCreate(BaseModel):
    name: str

class FolderOut(BaseModel):
    id: str
    name: str
    position: int
    created_at: datetime
    class Config:
        from_attributes = True

class ThreadCreate(BaseModel):
    title: Optional[str] = "New Chat"
    model: Optional[str] = "claude"
    folder_id: Optional[str] = None

class ThreadUpdate(BaseModel):
    title: Optional[str] = None
    folder_id: Optional[str] = None
    model: Optional[str] = None

class ThreadOut(BaseModel):
    id: str
    title: str
    summary: Optional[str]
    model: str
    folder_id: Optional[str]
    deleted_at: Optional[datetime]
    created_at: datetime
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content: str

class MessageOut(BaseModel):
    id: str
    thread_id: str
    role: str
    content: str
    created_at: datetime
    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    title: str
    date: str

class TaskUpdate(BaseModel):
    done: Optional[bool] = None
    title: Optional[str] = None

class TaskOut(BaseModel):
    id: str
    title: str
    done: bool
    date: str
    source_thread_id: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True
