from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Thread, Message
from schemas import MessageCreate, MessageOut
from typing import List
import asyncio
import random

router = APIRouter(prefix="/threads/{thread_id}/messages", tags=["messages"])

MOCK_RESPONSES = [
    "That's a great question! Here's what I think about it...\n\nLet me break this down step by step for you. First, consider the core problem you're trying to solve. Then we can work through the best approach together.",
    "I'd be happy to help with that! \n\nHere's my suggestion: start simple, then iterate. Don't over-engineer the solution — focus on what matters most to you right now.",
    "Interesting! There are a few ways to approach this.\n\n**Option 1:** Quick and simple — gets you moving fast.\n**Option 2:** More robust — takes longer but scales better.\n\nFor a personal project, I'd go with Option 1 first.",
    "Sure! Let me think through this with you.\n\nThe key thing to keep in mind here is that done is better than perfect. Start with a working version, then polish as you go.",
]

async def mock_stream(text: str):
    words = text.split(" ")
    for word in words:
        yield f"data: {word} \n\n"
        await asyncio.sleep(0.05)
    yield "data: [DONE]\n\n"

@router.get("/", response_model=List[MessageOut])
def get_messages(thread_id: str, db: Session = Depends(get_db)):
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    return thread.messages

@router.post("/")
async def send_message(thread_id: str, body: MessageCreate, db: Session = Depends(get_db)):
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    # save user message
    user_msg = Message(thread_id=thread_id, role="user", content=body.content)
    db.add(user_msg)

    # generate mock response
    response_text = random.choice(MOCK_RESPONSES)

    # save assistant message
    assistant_msg = Message(thread_id=thread_id, role="assistant", content=response_text)
    db.add(assistant_msg)

    # update thread title from first message
    if len(thread.messages) == 0:
        thread.title = body.content[:40] + ("..." if len(body.content) > 40 else "")
        thread.summary = f"Chat about: {body.content[:80]}"

    db.commit()

    return StreamingResponse(mock_stream(response_text), media_type="text/event-stream")
