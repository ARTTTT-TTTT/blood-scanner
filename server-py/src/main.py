from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi import FastAPI
import os

from .routers import users, blood, file_upload
from .auth import auth, login

app = FastAPI()
load_dotenv()

origins = [
    "http://localhost",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ.get("SECRET_KEY")
)

app.include_router(auth.router, prefix="/auth", tags=["Authorization"])
app.include_router(login.router, prefix="/login", tags=["Login"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(blood.router, prefix="/blood", tags=["Blood"])
app.include_router(file_upload.router, prefix="/files", tags=["File Upload"])
