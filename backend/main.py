from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import folders, threads, messages, tasks

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="My AI Hub")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(folders.router)
app.include_router(threads.router)
app.include_router(messages.router)
app.include_router(tasks.router)

@app.get("/")
def root():
    return {"status": "ok"}
