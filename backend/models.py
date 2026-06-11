from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Folder(Base):
    __tablename__ = "folders"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    position = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    threads = relationship("Thread", back_populates="folder")

class Thread(Base):
    __tablename__ = "threads"
    id = Column(String, primary_key=True, default=gen_uuid)
    folder_id = Column(String, ForeignKey("folders.id"), nullable=True)
    title = Column(String, default="New Chat")
    summary = Column(Text, nullable=True)
    model = Column(String, default="claude")
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    folder = relationship("Folder", back_populates="threads")
    messages = relationship("Message", back_populates="thread", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    id = Column(String, primary_key=True, default=gen_uuid)
    thread_id = Column(String, ForeignKey("threads.id"), nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    thread = relationship("Thread", back_populates="messages")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String, nullable=False)
    done = Column(Boolean, default=False)
    date = Column(String, nullable=False)
    source_thread_id = Column(String, ForeignKey("threads.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
